import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { Ride } from '../../database/entities/ride.entity';
import { UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Ride)
    private rideRepository: Repository<Ride>,
  ) {}

  /**
   * 获取用户信息
   */
  async getUserById(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return {
      id: user.id,
      nickname: user.nickname,
      avatar: user.avatar,
      rating: user.rating,
      phone: user.phone,
      createdAt: user.createdAt,
    };
  }

  /**
   * 更新用户信息
   */
  async updateUser(userId: number, updateDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    Object.assign(user, updateDto);
    await this.userRepository.save(user);

    return {
      id: user.id,
      nickname: user.nickname,
      avatar: user.avatar,
      rating: user.rating,
      phone: user.phone,
    };
  }

  /**
   * 获取用户统计数据
   */
  async getUserStatistics(userId: number) {
    const [published, total] = await Promise.all([
      this.rideRepository.count({ where: { userId } }),
      this.rideRepository.count({ where: { userId, status: 'completed' as any } }),
    ]);

    const allRides = await this.rideRepository.find({ where: { userId } });
    const findCar = allRides.filter(r => r.type === 'find-car').length;
    const findPassenger = allRides.filter(r => r.type === 'find-passenger').length;

    return {
      published,
      completed: total,
      findCar,
      findPassenger,
    };
  }

  /**
   * 实名认证（简化版，实际应接入第三方认证）
   */
  async verifyIdentity(userId: number, realName: string, idCard: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 简单格式校验
    if (!/^\d{17}[\dXx]$/.test(idCard)) {
      throw new Error('身份证号格式不正确');
    }

    user.isVerified = true;
    await this.userRepository.save(user);

    return { message: '认证成功' };
  }

  /**
   * 获取用户的拼车记录
   */
  async getUserRides(userId: number, status?: string) {
    const query = this.rideRepository
      .createQueryBuilder('ride')
      .where('ride.userId = :userId', { userId })
      .orderBy('ride.createdAt', 'DESC');

    if (status) {
      query.andWhere('ride.status = :status', { status });
    }

    const rides = await query.getMany();

    return rides.map(ride => ({
      id: ride.id,
      type: ride.type,
      departure: ride.departure,
      destination: ride.destination,
      departureTime: ride.departureTime,
      seats: ride.seats,
      price: ride.price,
      status: ride.status,
      viewCount: ride.viewCount,
      createdAt: ride.createdAt,
    }));
  }
}
