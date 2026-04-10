import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RideService } from './ride.service';
import { CreateRideDto, UpdateRideDto, QueryRideDto } from './dto/ride.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@ApiTags('拼车信息')
@Controller('rides')
export class RideController {
  constructor(private readonly rideService: RideService) {}

  /**
   * 发布拼车信息
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '发布拼车信息' })
  @ApiResponse({ status: 201, description: '发布成功' })
  async createRide(@Request() req, @Body() createDto: CreateRideDto) {
    return this.rideService.createRide(req.user.id, createDto);
  }

  /**
   * 查询拼车列表
   */
  @Get()
  @ApiOperation({ summary: '查询拼车列表' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async findRides(@Query() query: QueryRideDto) {
    return this.rideService.findRides(query);
  }

  /**
   * 获取拼车详情
   */
  @Get(':id')
  @ApiOperation({ summary: '获取拼车详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '拼车信息不存在' })
  async getRideById(@Param('id') id: number) {
    return this.rideService.getRideById(id);
  }

  /**
   * 更新拼车信息
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新拼车信息' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 403, description: '无权修改' })
  async updateRide(
    @Param('id') id: number,
    @Request() req,
    @Body() updateDto: UpdateRideDto,
  ) {
    return this.rideService.updateRide(id, req.user.id, updateDto);
  }

  /**
   * 取消拼车信息
   */
  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '取消拼车信息' })
  @ApiResponse({ status: 200, description: '取消成功' })
  @ApiResponse({ status: 403, description: '无权取消' })
  async cancelRide(@Param('id') id: number, @Request() req) {
    return this.rideService.cancelRide(id, req.user.id);
  }

  /**
   * 搜索拼车
   */
  @Get('search')
  @ApiOperation({ summary: '搜索拼车' })
  @ApiResponse({ status: 200, description: '搜索成功' })
  async searchRides(
    @Query('keyword') keyword: string,
    @Query('type') type?: string,
  ) {
    return this.rideService.searchRides(keyword, type);
  }

  /**
   * 删除拼车信息
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除拼车信息' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 403, description: '无权删除' })
  async deleteRide(@Param('id') id: number, @Request() req) {
    return this.rideService.deleteRide(id, req.user.id);
  }
}
