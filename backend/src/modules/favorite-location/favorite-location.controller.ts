import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FavoriteLocationService } from './favorite-location.service';
import { CreateFavoriteLocationDto, UpdateFavoriteLocationDto } from './dto/favorite-location.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@ApiTags('常用地点')
@Controller('favorite-locations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FavoriteLocationController {
  constructor(private readonly favoriteLocationService: FavoriteLocationService) {}

  @Get()
  @ApiOperation({ summary: '获取用户常用地点列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(@Request() req) {
    return this.favoriteLocationService.findByUser(req.user.id);
  }

  @Post()
  @ApiOperation({ summary: '添加常用地点' })
  @ApiResponse({ status: 201, description: '添加成功' })
  async create(@Request() req, @Body() createDto: CreateFavoriteLocationDto) {
    return this.favoriteLocationService.create(req.user.id, createDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: '编辑常用地点' })
  @ApiResponse({ status: 200, description: '编辑成功' })
  @ApiResponse({ status: 403, description: '无权修改' })
  @ApiResponse({ status: 404, description: '地点不存在' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Body() updateDto: UpdateFavoriteLocationDto,
  ) {
    return this.favoriteLocationService.update(id, req.user.id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除常用地点' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 403, description: '无权删除' })
  @ApiResponse({ status: 404, description: '地点不存在' })
  async delete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    await this.favoriteLocationService.delete(id, req.user.id);
    return { message: '删除成功' };
  }

  @Post(':id/increment')
  @ApiOperation({ summary: '使用次数 +1' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async incrementUseCount(@Param('id', ParseIntPipe) id: number, @Request() req) {
    await this.favoriteLocationService.incrementUseCount(id, req.user.id);
    return { message: '更新成功' };
  }
}
