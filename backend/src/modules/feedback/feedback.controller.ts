import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { IsEnum, IsString, Length, IsOptional } from 'class-validator';
import { FeedbackService } from './feedback.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

class CreateFeedbackDto {
  @IsEnum(['suggestion', 'bug', 'other'])
  type: string;

  @IsString()
  @Length(1, 500)
  content: string;

  @IsOptional()
  @IsString()
  @Length(0, 100)
  contactInfo?: string;
}

@ApiTags('意见反馈')
@Controller('feedback')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @ApiOperation({ summary: '提交意见反馈' })
  @ApiResponse({ status: 201, description: '提交成功' })
  async create(@Request() req, @Body() dto: CreateFeedbackDto) {
    return this.feedbackService.create(req.user.id, dto);
  }
}
