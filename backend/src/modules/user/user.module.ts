import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from '../../database/entities/user.entity';
import { Ride } from '../../database/entities/ride.entity';
import { Order } from '../../database/entities/order.entity';
import { Rating } from '../../database/entities/rating.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Ride, Order, Rating])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
