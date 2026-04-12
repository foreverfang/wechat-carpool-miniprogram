import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { Ride } from '../../database/entities/ride.entity';
import { Order } from '../../database/entities/order.entity';
import { Rating } from '../../database/entities/rating.entity';
import { UpdateUserDto, UpdateSettingsDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Ride)
    private rideRepository: Repository<Ride>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Rating)
    private ratingRepository: Repository<Rating>,
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
      notifyRideMatch: user.notifyRideMatch,
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

  async getUserStatistics(userId: number) {
    // 用户存在性检查
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('用户不存在');

    const allRides = await this.rideRepository.find({ where: { userId } });
    const published = allRides.length;
    const completed = allRides.filter(r => r.status === 'closed').length;
    const findCar = allRides.filter(r => r.type === 'find-car').length;
    const findPassenger = allRides.filter(r => r.type === 'find-passenger').length;

    // 参与的订单（作为乘客）
    const joinedOrders = await this.orderRepository.find({
      where: { passengerId: userId, status: 'completed' as any },
    });

    // 服务总人数（发布行程的 completed 订单数）
    const driverOrders = await this.orderRepository.find({
      where: { driverId: userId, status: 'completed' as any },
    });

    const totalPeople = driverOrders.length + joinedOrders.length;

    // 总里程估算：每次行程按 30km 固定估算（无里程字段）
    const KM_PER_RIDE = 30;
    const totalDistance = completed * KM_PER_RIDE;

    // 减碳量：每 km 减碳 0.2kg（私家车 vs 拼车）
    const carbonReduction = parseFloat((totalDistance * 0.2).toFixed(1));

    const topRoutes = this.buildTopRoutes(allRides);
    const badges = this.buildBadges({ published, completed, carbonReduction, totalPeople });

    return {
      published,
      completed,
      findCar,
      findPassenger,
      totalRides: published,
      totalDistance,
      totalPeople,
      carbonReduction,
      topRoutes,
      badges,
    };
  }

  /** 统计热门路线 TOP5 */
  private buildTopRoutes(rides: Ride[]): { departure: string; destination: string; count: number }[] {
    const routeMap = new Map<string, { departure: string; destination: string; count: number }>();
    for (const ride of rides) {
      const key = `${ride.departure}→${ride.destination}`;
      const entry = routeMap.get(key);
      if (entry) {
        entry.count++;
      } else {
        routeMap.set(key, { departure: ride.departure, destination: ride.destination, count: 1 });
      }
    }
    return Array.from(routeMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  /** 计算成就徽章解锁状态 */
  private buildBadges(stats: {
    published: number;
    completed: number;
    carbonReduction: number;
    totalPeople: number;
  }): { id: string; icon: string; name: string; unlocked: boolean }[] {
    const { published, completed, carbonReduction, totalPeople } = stats;
    return [
      { id: '1', icon: '🌟', name: '新手上路', unlocked: published >= 1 },
      { id: '2', icon: '🚗', name: '老司机', unlocked: completed >= 5 },
      { id: '3', icon: '🌱', name: '环保达人', unlocked: carbonReduction >= 10 },
      { id: '4', icon: '👥', name: '社交达人', unlocked: totalPeople >= 10 },
      { id: '5', icon: '🏆', name: '拼车之王', unlocked: completed >= 20 },
      { id: '6', icon: '💯', name: '完美评分', unlocked: false },
    ];
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
      throw new BadRequestException('身份证号格式不正确');
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

  /** 收到的评价 */
  async getReceivedRatings(userId: number) {
    const ratings = await this.ratingRepository.find({
      where: { toUserId: userId },
      order: { createdAt: 'DESC' },
    });
    return ratings.map(r => ({
      id: r.id,
      score: r.rating,
      comment: r.comment || '',
      createdAt: r.createdAt,
    }));
  }

  /** 我发出的评价 */
  async getGivenRatings(userId: number) {
    const ratings = await this.ratingRepository.find({
      where: { fromUserId: userId },
      order: { createdAt: 'DESC' },
    });
    return ratings.map(r => ({
      id: r.id,
      score: r.rating,
      comment: r.comment || '',
      createdAt: r.createdAt,
    }));
  }

  async updateSettings(userId: number, dto: UpdateSettingsDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('用户不存在');

    if (dto.notifyRideMatch !== undefined) {
      user.notifyRideMatch = dto.notifyRideMatch;
    }
    await this.userRepository.save(user);

    return { notifyRideMatch: user.notifyRideMatch };
  }
}
