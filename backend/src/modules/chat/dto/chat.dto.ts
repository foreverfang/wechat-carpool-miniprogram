import { IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConversationDto {
  @ApiProperty({ description: '目标用户ID' })
  @IsNumber()
  @IsNotEmpty()
  targetUserId: number;
}
