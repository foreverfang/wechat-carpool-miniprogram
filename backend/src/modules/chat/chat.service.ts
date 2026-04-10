import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';
import * as zlib from 'zlib';
import { User } from '../../database/entities/user.entity';
import { Ride } from '../../database/entities/ride.entity';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly sdkAppId: number;
  private readonly secretKey: string;
  // 管理员账号，用于调用 IM REST API
  private readonly adminUserId = 'admin';

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Ride)
    private rideRepository: Repository<Ride>,
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.sdkAppId = parseInt(
      this.configService.get<string>('TIM_SDK_APP_ID') || '0',
    );
    this.secretKey = this.configService.get<string>('TIM_SECRET_KEY') || '';
  }

  /**
   * 为用户创建 IM 账号（调用腾讯云 IM REST API）
   */
  async createImAccount(user: User): Promise<void> {
    const imUserId = `user_${user.id}`;

    if (!this.sdkAppId || !this.secretKey) {
      this.logger.warn('未配置腾讯云 IM，跳过 IM 账号创建');
      return;
    }

    try {
      const userSig = this.genUserSig(this.adminUserId, 86400); // 管理员 sig 有效期 1 天
      const url = `https://console.tim.qq.com/v4/im_open_login_svc/account_import`;
      const params = {
        sdkappid: this.sdkAppId,
        identifier: this.adminUserId,
        usersig: userSig,
        random: Math.floor(Math.random() * 4294967295),
        contenttype: 'json',
      };

      const body = {
        Identifier: imUserId,
        Nick: user.nickname || '微信用户',
        FaceUrl: user.avatar || '',
      };

      const response = await firstValueFrom(
        this.httpService.post(url, body, { params }),
      );

      if (response.data?.ActionStatus === 'OK') {
        await this.userRepository.update(user.id, { imUserId });
        this.logger.log(`用户 ${user.id} IM 账号创建成功: ${imUserId}`);
      } else {
        this.logger.error(
          `用户 ${user.id} IM 账号创建失败`,
          JSON.stringify(response.data),
        );
      }
    } catch (error) {
      this.logger.error(`用户 ${user.id} IM 账号创建异常`, error?.message);
    }
  }

  /**
   * 获取当前用户的 UserSig（有效期 7 天）
   */
  async getMyUserSig(
    userId: number,
  ): Promise<{ imUserId: string; userSig: string; sdkAppId: number }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 若尚未创建 IM 账号，自动创建
    if (!user.imUserId) {
      await this.createImAccount(user);
      const updated = await this.userRepository.findOne({ where: { id: userId } });
      if (updated?.imUserId) {
        user.imUserId = updated.imUserId;
      }
    }

    const imUserId = user.imUserId || `user_${userId}`;
    const expire = 7 * 24 * 60 * 60; // 7天（秒）
    const userSig = this.genUserSig(imUserId, expire);

    return { imUserId, userSig, sdkAppId: this.sdkAppId };
  }

  /**
   * 创建单聊会话（需校验拼车关联）
   */
  async createConversation(currentUserId: number, targetUserId: number) {
    const hasRelation = await this.checkRideRelation(currentUserId, targetUserId);
    if (!hasRelation) {
      throw new ForbiddenException('只能与拼车相关用户聊天');
    }

    const [currentUser, targetUser] = await Promise.all([
      this.userRepository.findOne({ where: { id: currentUserId } }),
      this.userRepository.findOne({ where: { id: targetUserId } }),
    ]);

    if (!currentUser || !targetUser) {
      throw new NotFoundException('用户不存在');
    }

    const fromImId = currentUser.imUserId || `user_${currentUserId}`;
    const toImId = targetUser.imUserId || `user_${targetUserId}`;

    return {
      fromImId,
      toImId,
      conversationId: `C2C${toImId}`,
    };
  }

  /**
   * 检查两个用户是否有拼车关联（任一方有 active 状态的拼车）
   */
  private async checkRideRelation(
    userIdA: number,
    userIdB: number,
  ): Promise<boolean> {
    const count = await this.rideRepository
      .createQueryBuilder('ride')
      .where(
        '(ride.userId = :userIdA OR ride.userId = :userIdB) AND ride.status = :status',
        { userIdA, userIdB, status: 'active' },
      )
      .getCount();

    return count > 0;
  }

  /**
   * 生成 UserSig（HMAC-SHA256 算法，符合腾讯云 IM 规范）
   */
  private genUserSig(userId: string, expire: number): string {
    if (!this.sdkAppId || !this.secretKey) {
      return 'no-im-config';
    }

    const currTime = Math.floor(Date.now() / 1000);

    // HMAC-SHA256 签名内容（顺序固定）
    const rawContent =
      'TLS.identifier:' + userId + '\n' +
      'TLS.sdkappid:' + this.sdkAppId + '\n' +
      'TLS.time:' + currTime + '\n' +
      'TLS.expire:' + expire + '\n';

    const hmac = crypto.createHmac('sha256', this.secretKey);
    const sig = hmac.update(rawContent).digest('base64');

    // 官方 SDK 格式：平铺 key，非嵌套对象
    const sigDoc = {
      'TLS.ver': '2.0',
      'TLS.identifier': String(userId),
      'TLS.sdkappid': Number(this.sdkAppId),
      'TLS.time': Number(currTime),
      'TLS.expire': Number(expire),
      'TLS.sig': sig,
    };

    // 官方用 deflateSync（带 zlib header），非 deflateRaw
    const compressed = zlib.deflateSync(Buffer.from(JSON.stringify(sigDoc), 'utf8'));
    return compressed
      .toString('base64')
      .replace(/\+/g, '*')
      .replace(/\//g, '-')
      .replace(/=/g, '_');
  }
}
