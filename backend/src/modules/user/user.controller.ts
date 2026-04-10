import { Controller, Get, Patch, Post, Body, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateUserDto, VerifyIdentityDto } from './dto/user.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@ApiTags('用户')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 获取当前用户信息
   */
  @Get('profile')
  @ApiOperation({ summary: '获取当前用户信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getProfile(@Request() req) {
    return this.userService.getUserById(req.user.id);
  }

  /**
   * 更新用户信息
   */
  @Patch('profile')
  @ApiOperation({ summary: '更新用户信息' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateProfile(@Request() req, @Body() updateDto: UpdateUserDto) {
    return this.userService.updateUser(req.user.id, updateDto);
  }

  /**
   * 获取用户统计数据
   */
  @Get('statistics')
  @ApiOperation({ summary: '获取用户统计数据' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getStatistics(@Request() req) {
    return this.userService.getUserStatistics(req.user.id);
  }

  /**
   * 实名认证
   */
  @Post('verify')
  @ApiOperation({ summary: '实名认证' })
  @ApiResponse({ status: 200, description: '认证成功' })
  async verifyIdentity(@Request() req, @Body() dto: VerifyIdentityDto) {
    return this.userService.verifyIdentity(req.user.id, dto.realName, dto.idCard);
  }

  /**
   * 获取用户的拼车记录
   */
  @Get('rides')
  @ApiOperation({ summary: '获取用户的拼车记录' })
  @ApiQuery({ name: 'status', required: false, description: '状态筛选' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getUserRides(@Request() req, @Query('status') status?: string) {
    return this.userService.getUserRides(req.user.id, status);
  }
}
