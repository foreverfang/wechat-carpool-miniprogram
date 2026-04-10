import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { User } from '../../database/entities/user.entity';
import { Ride } from '../../database/entities/ride.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Ride]), HttpModule],
  providers: [ChatService],
  controllers: [ChatController],
  exports: [ChatService],
})
export class ChatModule {}
