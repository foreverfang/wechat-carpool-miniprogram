import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavoriteLocation } from '../../database/entities/favorite-location.entity';
import { FavoriteLocationController } from './favorite-location.controller';
import { FavoriteLocationService } from './favorite-location.service';

@Module({
  imports: [TypeOrmModule.forFeature([FavoriteLocation])],
  controllers: [FavoriteLocationController],
  providers: [FavoriteLocationService],
  exports: [FavoriteLocationService],
})
export class FavoriteLocationModule {}
