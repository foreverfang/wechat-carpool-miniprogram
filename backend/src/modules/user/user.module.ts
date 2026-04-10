import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from '../../database/entities/user.entity';
import { Ride } from '../../database/entities/ride.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Ride])],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
