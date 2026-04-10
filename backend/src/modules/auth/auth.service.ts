import { Injectable, UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { User } from '../../database/entities/user.entity';
import { ChatService } from '../chat/chat.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private httpService: HttpService,
    private configService: ConfigService,
    @Inject(forwardRef(() => ChatService))
    private chatService: ChatService,
  ) {}

  /**
   * 微信小程序登录
   */
  async wechatLogin(code: string) {
    // 开发环境：如果 code 以 'dev_' 开头，使用测试登录
    if (code.startsWith('dev_')) {
      return this.devLogin(code);
    }

    // 1. 使用 code 换取 openid
    const { openid, sessionKey } = await this.getWechatOpenId(code);

    // 2. 查找或创建用户
    let user = await this.userRepository.findOne({ where: { openid } });

    if (!user) {
      user = this.userRepository.create({
        openid,
        nickname: '微信用户',
        avatar: '',
        status: 'active',
      });
      await this.userRepository.save(user);
      // 新用户注册后异步创建 IM 账号
      this.chatService.createImAccount(user);
    }

    // 3. 生成 JWT token
    const token = await this.generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
        rating: user.rating,
      },
    };
  }

  /**
   * 开发环境测试登录（跳过微信验证）
   */
  private async devLogin(code: string) {
    const openid = code; // 使用 code 作为 openid

    let user = await this.userRepository.findOne({ where: { openid } });

    if (!user) {
      user = this.userRepository.create({
        openid,
        nickname: '测试用户',
        avatar: 'https://via.placeholder.com/100',
        status: 'active',
      });
      await this.userRepository.save(user);
      // 新用户注册后异步创建 IM 账号
      this.chatService.createImAccount(user);
    }

    const token = await this.generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
        rating: user.rating,
      },
    };
  }

  /**
   * 使用微信 code 换取 openid
   */
  private async getWechatOpenId(code: string) {
    const appid = this.configService.get('WECHAT_APPID');
    const secret = this.configService.get('WECHAT_SECRET');

    console.log('[微信登录] 开始调用微信 API');
    console.log('[微信登录] code:', code);
    console.log('[微信登录] appid:', appid);

    const url = `https://api.weixin.qq.com/sns/jscode2session`;
    const params = {
      appid,
      secret,
      js_code: code,
      grant_type: 'authorization_code',
    };

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, { params }),
      );

      console.log('[微信登录] 微信 API 响应:', JSON.stringify(response.data));

      const { openid, session_key, errcode, errmsg } = response.data;

      if (errcode) {
        console.error('[微信登录] 微信 API 返回错误:', errcode, errmsg);
        throw new UnauthorizedException(`微信登录失败: ${errmsg} (错误码: ${errcode})`);
      }

      console.log('[微信登录] 登录成功, openid:', openid);
      return {
        openid,
        sessionKey: session_key,
      };
    } catch (error) {
      console.error('[微信登录] 异常:', error.message || error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('微信登录失败: 网络错误或服务异常');
    }
  }

  /**
   * 生成 JWT token
   */
  async generateToken(user: User) {
    const payload = {
      sub: user.id,
      openid: user.openid,
    };

    return this.jwtService.sign(payload);
  }

  /**
   * 验证用户
   */
  async validateUser(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('用户不存在或已被禁用');
    }

    return user;
  }

  /**
   * 刷新 token
   */
  async refreshToken(oldToken: string) {
    try {
      const payload = this.jwtService.verify(oldToken);
      const user = await this.validateUser(payload.sub);
      return this.generateToken(user);
    } catch (error) {
      throw new UnauthorizedException('Token 无效或已过期');
    }
  }
}
