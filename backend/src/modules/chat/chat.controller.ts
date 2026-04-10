import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ChatService } from './chat.service';
import { CreateConversationDto } from './dto/chat.dto';

@ApiTags('聊天')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('user-sig')
  @ApiOperation({ summary: '获取 IM UserSig' })
  async getUserSig(@Request() req) {
    return this.chatService.getMyUserSig(req.user.id);
  }

  @Post('conversation')
  @ApiOperation({ summary: '创建单聊会话' })
  async createConversation(
    @Request() req,
    @Body() dto: CreateConversationDto,
  ) {
    return this.chatService.createConversation(req.user.id, dto.targetUserId);
  }
}
