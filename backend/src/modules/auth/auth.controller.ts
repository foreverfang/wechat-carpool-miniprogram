import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { WechatLoginDto, RefreshTokenDto } from './dto/auth.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 微信小程序登录
   */
  @Post('wechat-login')
  @ApiOperation({ summary: '微信小程序登录' })
  @ApiResponse({ status: 200, description: '登录成功' })
  @ApiResponse({ status: 401, description: '登录失败' })
  async wechatLogin(@Body() loginDto: WechatLoginDto) {
    return this.authService.wechatLogin(loginDto.code);
  }

  /**
   * 刷新 token
   */
  @Post('refresh')
  @ApiOperation({ summary: '刷新 Token' })
  @ApiResponse({ status: 200, description: '刷新成功' })
  @ApiResponse({ status: 401, description: 'Token 无效' })
  async refreshToken(@Body() refreshDto: RefreshTokenDto) {
    const newToken = await this.authService.refreshToken(refreshDto.refreshToken);
    return { token: newToken };
  }

  /**
   * 获取当前用户信息
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async getProfile(@Request() req) {
    return {
      id: req.user.id,
      nickname: req.user.nickname,
      avatar: req.user.avatar,
      rating: req.user.rating,
      phone: req.user.phone,
    };
  }
}
