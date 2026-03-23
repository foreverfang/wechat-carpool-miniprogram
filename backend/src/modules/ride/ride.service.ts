import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Ride } from '../../database/entities/ride.entity';
import { CreateRideDto, UpdateRideDto, QueryRideDto } from './dto/ride.dto';

@Injectable()
export class RideService {
  private readonly logger = new Logger(RideService.name);

  constructor(
    @InjectRepository(Ride)
    private rideRepository: Repository<Ride>,
  ) {}

  /**
   * 每5分钟检查并将出发时间已过的拼车标记为 expired
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleExpiredRides() {
    const result = await this.rideRepository.update(
      { status: 'active', departureTime: LessThan(new Date()) },
      { status: 'expired' },
    );
    if (result.affected && result.affected > 0) {
      this.logger.log(`已将 ${result.affected} 条拼车信息标记为过期`);
    }
  }

  /**
   * 发布拼车信息
   */
  async createRide(userId: number, createDto: CreateRideDto) {
    const ride = this.rideRepository.create({
      ...createDto,
      userId,
      status: 'active',
    });

    await this.rideRepository.save(ride);

    return ride;
  }

  /**
   * 查询拼车列表
   */
  async findRides(query: QueryRideDto) {
    const { type, departure, destination, page = 1, limit = 10 } = query;

    const queryBuilder = this.rideRepository
      .createQueryBuilder('ride')
      .leftJoinAndSelect('ride.user', 'user')
      .where('ride.status = :status', { status: 'active' })
      .andWhere('ride.deletedAt IS NULL');

    if (type) {
      queryBuilder.andWhere('ride.type = :type', { type });
    }

    if (departure) {
      queryBuilder.andWhere('ride.departure LIKE :departure', {
        departure: `%${departure}%`,
      });
    }

    if (destination) {
      queryBuilder.andWhere('ride.destination LIKE :destination', {
        destination: `%${destination}%`,
      });
    }

    const [rides, total] = await queryBuilder
      .orderBy('ride.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      list: rides.map(ride => ({
        id: ride.id,
        type: ride.type,
        departure: ride.departure,
        departureLocation: ride.departureLocation,
        destination: ride.destination,
        destinationLocation: ride.destinationLocation,
        waypoints: ride.waypoints,
        departureTime: ride.departureTime,
        seats: ride.seats,
        price: ride.price,
        note: ride.note,
        status: ride.status,
        viewCount: ride.viewCount,
        createdAt: ride.createdAt,
        user: {
          id: ride.user.id,
          nickname: ride.user.nickname,
          avatar: ride.user.avatar,
          rating: ride.user.rating,
        },
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 获取拼车详情
   */
  async getRideById(id: number) {
    const ride = await this.rideRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!ride || ride.deletedAt) {
      throw new NotFoundException('拼车信息不存在');
    }

    // 增加浏览次数
    ride.viewCount += 1;
    await this.rideRepository.save(ride);

    return {
      id: ride.id,
      type: ride.type,
      departure: ride.departure,
      departureLocation: ride.departureLocation,
      destination: ride.destination,
      destinationLocation: ride.destinationLocation,
      waypoints: ride.waypoints,
      departureTime: ride.departureTime,
      seats: ride.seats,
      price: ride.price,
      note: ride.note,
      status: ride.status,
      viewCount: ride.viewCount,
      createdAt: ride.createdAt,
      user: {
        id: ride.user.id,
        nickname: ride.user.nickname,
        avatar: ride.user.avatar,
        rating: ride.user.rating,
      },
    };
  }

  /**
   * 更新拼车信息
   */
  async updateRide(id: number, userId: number, updateDto: UpdateRideDto) {
    const ride = await this.rideRepository.findOne({ where: { id } });

    if (!ride || ride.deletedAt) {
      throw new NotFoundException('拼车信息不存在');
    }

    if (ride.userId !== userId) {
      throw new ForbiddenException('无权修改此拼车信息');
    }

    Object.assign(ride, updateDto);
    await this.rideRepository.save(ride);

    return ride;
  }

  /**
   * 取消拼车信息
   */
  async cancelRide(id: number, userId: number) {
    const ride = await this.rideRepository.findOne({ where: { id } });

    if (!ride || ride.deletedAt) {
      throw new NotFoundException('拼车信息不存在');
    }

    if (ride.userId !== userId) {
      throw new ForbiddenException('无权取消此拼车信息');
    }

    ride.status = 'cancelled';
    await this.rideRepository.save(ride);

    return { message: '取消成功' };
  }

  /**
   * 搜索拼车（关键词匹配出发地或目的地）
   */
  async searchRides(keyword: string, type?: string) {
    const queryBuilder = this.rideRepository
      .createQueryBuilder('ride')
      .leftJoinAndSelect('ride.user', 'user')
      .where('ride.status = :status', { status: 'active' })
      .andWhere('ride.deletedAt IS NULL')
      .andWhere(
        '(ride.departure LIKE :kw OR ride.destination LIKE :kw)',
        { kw: `%${keyword}%` },
      );

    if (type) {
      queryBuilder.andWhere('ride.type = :type', { type });
    }

    const rides = await queryBuilder.orderBy('ride.createdAt', 'DESC').take(20).getMany();

    return {
      list: rides.map(ride => ({
        id: ride.id,
        type: ride.type,
        departure: ride.departure,
        destination: ride.destination,
        departureTime: ride.departureTime,
        seats: ride.seats,
        price: ride.price,
        note: ride.note,
        status: ride.status,
        createdAt: ride.createdAt,
        user: {
          id: ride.user.id,
          nickname: ride.user.nickname,
          avatar: ride.user.avatar,
          rating: ride.user.rating,
        },
      })),
    };
  }

  /**
   * 删除拼车信息(软删除)
   */
  async deleteRide(id: number, userId: number) {
    const ride = await this.rideRepository.findOne({ where: { id } });

    if (!ride || ride.deletedAt) {
      throw new NotFoundException('拼车信息不存在');
    }

    if (ride.userId !== userId) {
      throw new ForbiddenException('无权删除此拼车信息');
    }

    await this.rideRepository.softDelete(id);

    return { message: '删除成功' };
  }
}
