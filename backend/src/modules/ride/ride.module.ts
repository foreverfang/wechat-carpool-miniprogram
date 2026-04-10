import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RideService } from './ride.service';
import { RideController } from './ride.controller';
import { Ride } from '../../database/entities/ride.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ride])],
  providers: [RideService],
  controllers: [RideController],
  exports: [RideService],
})
export class RideModule {}
