import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FavoriteLocation } from '../../database/entities/favorite-location.entity';
import { CreateFavoriteLocationDto, UpdateFavoriteLocationDto } from './dto/favorite-location.dto';

@Injectable()
export class FavoriteLocationService {
  constructor(
    @InjectRepository(FavoriteLocation)
    private favoriteLocationRepository: Repository<FavoriteLocation>,
  ) {}

  async findByUser(userId: number): Promise<FavoriteLocation[]> {
    return this.favoriteLocationRepository.find({
      where: { userId },
      order: { useCount: 'DESC', createdAt: 'DESC' },
    });
  }

  async create(userId: number, createDto: CreateFavoriteLocationDto): Promise<FavoriteLocation> {
    const location = this.favoriteLocationRepository.create({ ...createDto, userId });
    return this.favoriteLocationRepository.save(location);
  }

  async update(id: number, userId: number, updateDto: UpdateFavoriteLocationDto): Promise<FavoriteLocation> {
    const location = await this.favoriteLocationRepository.findOne({ where: { id } });
    if (!location) throw new NotFoundException('常用地点不存在');
    if (location.userId !== userId) throw new ForbiddenException('无权修改此地点');
    Object.assign(location, updateDto);
    return this.favoriteLocationRepository.save(location);
  }

  async delete(id: number, userId: number): Promise<void> {
    const location = await this.favoriteLocationRepository.findOne({ where: { id } });
    if (!location) throw new NotFoundException('常用地点不存在');
    if (location.userId !== userId) throw new ForbiddenException('无权删除此地点');
    await this.favoriteLocationRepository.remove(location);
  }

  async incrementUseCount(id: number, userId: number): Promise<void> {
    const location = await this.favoriteLocationRepository.findOne({ where: { id, userId } });
    if (!location) return;
    location.useCount += 1;
    await this.favoriteLocationRepository.save(location);
  }

  async findByCoordinates(userId: number, latitude: number, longitude: number): Promise<FavoriteLocation | null> {
    const locations = await this.findByUser(userId);
    for (const location of locations) {
      if (location.latitude && location.longitude) {
        const distance = this.calculateDistance(latitude, longitude, location.latitude, location.longitude);
        if (distance < 0.1) return location;
      }
    }
    return null;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
