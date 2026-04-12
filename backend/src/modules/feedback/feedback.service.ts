import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from './feedback.entity';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
  ) {}

  async create(userId: number, dto: { type: string; content: string; contactInfo?: string }) {
    const feedback = this.feedbackRepository.create({
      userId,
      type: dto.type,
      content: dto.content,
      contactInfo: dto.contactInfo,
    });
    await this.feedbackRepository.save(feedback);
    return { message: '反馈提交成功' };
  }
}
