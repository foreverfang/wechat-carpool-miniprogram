# 发布体验优化实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为拼车小程序添加快速发布功能,支持历史行程复用和常用地点管理,提升发布效率

**Architecture:** 后端新增 FavoriteLocation 模块管理常用地点,RideService 新增历史行程查询接口;前端发布页拆分为多个组件(QuickActions、HistoryRides、LocationPicker),个人中心新增常用地点管理页

**Tech Stack:** 
- 后端: NestJS + TypeORM + MySQL
- 前端: uni-app + Vue 3 + TypeScript

---

## 文件结构规划

### 后端新增文件
```
backend/src/
├── database/entities/
│   └── favorite-location.entity.ts          # 常用地点实体
├── modules/
│   └── favorite-location/
│       ├── favorite-location.module.ts      # 模块定义
│       ├── favorite-location.controller.ts  # 控制器
│       ├── favorite-location.service.ts     # 服务层
│       └── dto/
│           └── favorite-location.dto.ts     # DTO 定义
└── database/migrations/
    └── 1713715200000-CreateFavoriteLocations.ts  # 数据库迁移
```

### 后端修改文件
```
backend/src/
├── app.module.ts                            # 注册 FavoriteLocation 模块
├── modules/ride/
│   ├── ride.service.ts                      # 新增历史行程查询方法
│   ├── ride.controller.ts                   # 新增历史行程接口
│   └── dto/ride.dto.ts                      # 新增历史行程 DTO
└── database/entities/ride.entity.ts         # 添加索引注释
```

### 前端新增文件
```
wechat-carpool-miniprogram/src/
├── pages/publish/components/
│   ├── QuickActions.vue                     # 快捷操作区组件
│   ├── HistoryRides.vue                     # 历史行程卡片组件
│   ├── HistoryDrawer.vue                    # 历史行程抽屉组件
│   └── LocationPicker.vue                   # 地点选择器组件
├── pages/profile/
│   └── favorite-locations.vue               # 常用地点管理页
└── api/
    └── favorite-location.ts                 # 常用地点 API
```

### 前端修改文件
```
wechat-carpool-miniprogram/src/
├── pages/publish/index.vue                  # 集成新组件
├── pages.json                               # 注册常用地点管理页
└── api/ride.ts                              # 新增历史行程 API
```

---

## Task 1: 创建常用地点数据库表

**Files:**
- Create: `backend/src/database/migrations/1713715200000-CreateFavoriteLocations.ts`

- [ ] **Step 1: 创建迁移文件**

```typescript
import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateFavoriteLocations1713715200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'favorite_locations',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'user_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '50',
            isNullable: false,
            comment: '地点名称',
          },
          {
            name: 'address',
            type: 'varchar',
            length: '200',
            isNullable: false,
            comment: '详细地址',
          },
          {
            name: 'latitude',
            type: 'decimal',
            precision: 10,
            scale: 7,
            isNullable: true,
            comment: '纬度',
          },
          {
            name: 'longitude',
            type: 'decimal',
            precision: 10,
            scale: 7,
            isNullable: true,
            comment: '经度',
          },
          {
            name: 'use_count',
            type: 'int',
            default: 0,
            comment: '使用次数',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // 创建索引
    await queryRunner.createIndex(
      'favorite_locations',
      new TableIndex({
        name: 'idx_user_id',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'favorite_locations',
      new TableIndex({
        name: 'idx_use_count',
        columnNames: ['user_id', 'use_count'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('favorite_locations');
  }
}
```

- [ ] **Step 2: 运行迁移**

```bash
cd backend
npm run migration:run
```

预期输出: `Migration CreateFavoriteLocations1713715200000 has been executed successfully.`

- [ ] **Step 3: 验证表创建**

```bash
mysql -u root -p carpool_db -e "DESCRIBE favorite_locations;"
```

预期输出: 显示表结构,包含 id, user_id, name, address, latitude, longitude, use_count, created_at, updated_at 字段

- [ ] **Step 4: 提交**

```bash
git add backend/src/database/migrations/1713715200000-CreateFavoriteLocations.ts
git commit -m "feat: 创建常用地点数据库表"
```

---

## Task 2: 创建 FavoriteLocation 实体

**Files:**
- Create: `backend/src/database/entities/favorite-location.entity.ts`

- [ ] **Step 1: 创建实体文件**

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('favorite_locations')
export class FavoriteLocation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ length: 50 })
  name: string;

  @Column({ length: 200 })
  address: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({ name: 'use_count', default: 0 })
  useCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

- [ ] **Step 2: 提交**

```bash
git add backend/src/database/entities/favorite-location.entity.ts
git commit -m "feat: 创建 FavoriteLocation 实体"
```

---

## Task 3: 创建 FavoriteLocation DTO

**Files:**
- Create: `backend/src/modules/favorite-location/dto/favorite-location.dto.ts`

- [ ] **Step 1: 创建 DTO 文件**

```typescript
import { IsString, IsNumber, IsOptional, Length, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFavoriteLocationDto {
  @ApiProperty({ description: '地点名称', example: '家' })
  @IsString()
  @Length(1, 50)
  name: string;

  @ApiProperty({ description: '详细地址', example: '广州市天河区xxx路xxx号' })
  @IsString()
  @Length(1, 200)
  address: string;

  @ApiPropertyOptional({ description: '纬度', example: 23.123456 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ description: '经度', example: 113.123456 })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}

export class UpdateFavoriteLocationDto {
  @ApiPropertyOptional({ description: '地点名称', example: '公司' })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  name?: string;

  @ApiPropertyOptional({ description: '详细地址', example: '广州市番禺区xxx路xxx号' })
  @IsOptional()
  @IsString()
  @Length(1, 200)
  address?: string;

  @ApiPropertyOptional({ description: '纬度', example: 23.456789 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ description: '经度', example: 113.456789 })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}
```

- [ ] **Step 2: 提交**

```bash
git add backend/src/modules/favorite-location/dto/favorite-location.dto.ts
git commit -m "feat: 创建 FavoriteLocation DTO"
```

---

## Task 4: 创建 FavoriteLocation Service

**Files:**
- Create: `backend/src/modules/favorite-location/favorite-location.service.ts`

- [ ] **Step 1: 创建 Service 文件**

```typescript
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FavoriteLocation } from '../../database/entities/favorite-location.entity';
import {
  CreateFavoriteLocationDto,
  UpdateFavoriteLocationDto,
} from './dto/favorite-location.dto';

@Injectable()
export class FavoriteLocationService {
  constructor(
    @InjectRepository(FavoriteLocation)
    private favoriteLocationRepository: Repository<FavoriteLocation>,
  ) {}

  /**
   * 获取用户的常用地点列表(按使用次数降序)
   */
  async findByUser(userId: number): Promise<FavoriteLocation[]> {
    return this.favoriteLocationRepository.find({
      where: { userId },
      order: { useCount: 'DESC', createdAt: 'DESC' },
    });
  }

  /**
   * 创建常用地点
   */
  async create(
    userId: number,
    createDto: CreateFavoriteLocationDto,
  ): Promise<FavoriteLocation> {
    const location = this.favoriteLocationRepository.create({
      ...createDto,
      userId,
    });

    return this.favoriteLocationRepository.save(location);
  }

  /**
   * 更新常用地点
   */
  async update(
    id: number,
    userId: number,
    updateDto: UpdateFavoriteLocationDto,
  ): Promise<FavoriteLocation> {
    const location = await this.favoriteLocationRepository.findOne({
      where: { id },
    });

    if (!location) {
      throw new NotFoundException('常用地点不存在');
    }

    if (location.userId !== userId) {
      throw new ForbiddenException('无权修改此地点');
    }

    Object.assign(location, updateDto);
    return this.favoriteLocationRepository.save(location);
  }

  /**
   * 删除常用地点
   */
  async delete(id: number, userId: number): Promise<void> {
    const location = await this.favoriteLocationRepository.findOne({
      where: { id },
    });

    if (!location) {
      throw new NotFoundException('常用地点不存在');
    }

    if (location.userId !== userId) {
      throw new ForbiddenException('无权删除此地点');
    }

    await this.favoriteLocationRepository.remove(location);
  }

  /**
   * 使用次数 +1
   */
  async incrementUseCount(id: number, userId: number): Promise<void> {
    const location = await this.favoriteLocationRepository.findOne({
      where: { id, userId },
    });

    if (!location) {
      return; // 静默失败,不影响主流程
    }

    location.useCount += 1;
    await this.favoriteLocationRepository.save(location);
  }

  /**
   * 根据坐标查找匹配的常用地点(距离 < 100m)
   */
  async findByCoordinates(
    userId: number,
    latitude: number,
    longitude: number,
  ): Promise<FavoriteLocation | null> {
    const locations = await this.findByUser(userId);

    for (const location of locations) {
      if (location.latitude && location.longitude) {
        const distance = this.calculateDistance(
          latitude,
          longitude,
          location.latitude,
          location.longitude,
        );

        if (distance < 0.1) {
          // 小于 100m
          return location;
        }
      }
    }

    return null;
  }

  /**
   * 计算两点间距离(km)
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // 地球半径(km)
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add backend/src/modules/favorite-location/favorite-location.service.ts
git commit -m "feat: 创建 FavoriteLocation Service"
```

---

## Task 5: 创建 FavoriteLocation Controller

**Files:**
- Create: `backend/src/modules/favorite-location/favorite-location.controller.ts`

- [ ] **Step 1: 创建 Controller 文件**

```typescript
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FavoriteLocationService } from './favorite-location.service';
import {
  CreateFavoriteLocationDto,
  UpdateFavoriteLocationDto,
} from './dto/favorite-location.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@ApiTags('常用地点')
@Controller('favorite-locations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FavoriteLocationController {
  constructor(
    private readonly favoriteLocationService: FavoriteLocationService,
  ) {}

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
    @Param('id') id: number,
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
  async delete(@Param('id') id: number, @Request() req) {
    await this.favoriteLocationService.delete(id, req.user.id);
    return { message: '删除成功' };
  }

  @Post(':id/increment')
  @ApiOperation({ summary: '使用次数 +1' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async incrementUseCount(@Param('id') id: number, @Request() req) {
    await this.favoriteLocationService.incrementUseCount(id, req.user.id);
    return { message: '更新成功' };
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add backend/src/modules/favorite-location/favorite-location.controller.ts
git commit -m "feat: 创建 FavoriteLocation Controller"
```

---

## Task 6: 创建 FavoriteLocation Module

**Files:**
- Create: `backend/src/modules/favorite-location/favorite-location.module.ts`
- Modify: `backend/src/app.module.ts`

- [ ] **Step 1: 创建 Module 文件**

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavoriteLocation } from '../../database/entities/favorite-location.entity';
import { FavoriteLocationController } from './favorite-location.controller';
import { FavoriteLocationService } from './favorite-location.service';

@Module({
  imports: [TypeOrmModule.forFeature([FavoriteLocation])],
  controllers: [FavoriteLocationController],
  providers: [FavoriteLocationService],
  exports: [FavoriteLocationService],
})
export class FavoriteLocationModule {}
```

- [ ] **Step 2: 在 app.module.ts 中注册模块**

在 `backend/src/app.module.ts` 的 imports 数组中添加:

```typescript
import { FavoriteLocationModule } from './modules/favorite-location/favorite-location.module';

@Module({
  imports: [
    // ...existing imports
    FavoriteLocationModule,
  ],
  // ...
})
```

- [ ] **Step 3: 提交**

```bash
git add backend/src/modules/favorite-location/favorite-location.module.ts backend/src/app.module.ts
git commit -m "feat: 创建并注册 FavoriteLocation Module"
```

---

## Task 7: 在 RideService 中添加历史行程查询方法

**Files:**
- Modify: `backend/src/modules/ride/ride.service.ts`

- [ ] **Step 1: 添加 getMyHistory 方法**

在 `RideService` 类中添加以下方法:

```typescript
/**
 * 获取用户历史行程
 */
async getMyHistory(userId: number, limit: number = 10) {
  const rides = await this.rideRepository.find({
    where: { userId },
    order: { createdAt: 'DESC' },
    take: limit,
  });

  return rides.map(ride => ({
    id: ride.id,
    type: ride.type,
    departure: ride.departure,
    departureLocation: ride.departureLocation,
    destination: ride.destination,
    destinationLocation: ride.destinationLocation,
    waypoints: ride.waypoints,
    departureTime: ride.departureTime,
    seats: ride.seats,
    price: ride.price,
    note: ride.note,
  }));
}
```

- [ ] **Step 2: 提交**

```bash
git add backend/src/modules/ride/ride.service.ts
git commit -m "feat: 添加历史行程查询方法"
```

---

## Task 8: 在 RideController 中添加历史行程接口

**Files:**
- Modify: `backend/src/modules/ride/ride.controller.ts`

- [ ] **Step 1: 添加历史行程接口**

在 `RideController` 类中添加以下方法:

```typescript
@Get('history')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiOperation({ summary: '获取用户历史行程' })
@ApiResponse({ status: 200, description: '获取成功' })
async getMyHistory(
  @Request() req,
  @Query('limit') limit: number = 10,
) {
  return this.rideService.getMyHistory(req.user.id, limit);
}
```

- [ ] **Step 2: 提交**

```bash
git add backend/src/modules/ride/ride.controller.ts
git commit -m "feat: 添加历史行程查询接口"
```

---

## Task 9: 测试后端 API

**Files:**
- None (testing only)

- [ ] **Step 1: 启动后端服务**

```bash
cd backend
npm run start:dev
```

预期输出: `Application is running on: http://localhost:3000`

- [ ] **Step 2: 测试常用地点 API**

使用 Postman 或 curl 测试:

```bash
# 获取 token (先登录)
TOKEN="your_jwt_token"

# 创建常用地点
curl -X POST http://localhost:3000/api/favorite-locations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "家",
    "address": "广州市天河区xxx路xxx号",
    "latitude": 23.123456,
    "longitude": 113.123456
  }'

# 获取常用地点列表
curl -X GET http://localhost:3000/api/favorite-locations \
  -H "Authorization: Bearer $TOKEN"
```

预期: 返回 200 状态码和正确的数据

- [ ] **Step 3: 测试历史行程 API**

```bash
# 获取历史行程
curl -X GET "http://localhost:3000/api/rides/history?limit=3" \
  -H "Authorization: Bearer $TOKEN"
```

预期: 返回 200 状态码和历史行程列表

---

## Task 10: 创建前端常用地点 API 文件

**Files:**
- Create: `wechat-carpool-miniprogram/src/api/favorite-location.ts`

- [ ] **Step 1: 创建 API 文件**

```typescript
import request from './request'

export interface FavoriteLocation {
  id: number
  name: string
  address: string
  latitude?: number
  longitude?: number
  useCount: number
  createdAt: string
}

export interface CreateFavoriteLocationDto {
  name: string
  address: string
  latitude?: number
  longitude?: number
}

export interface UpdateFavoriteLocationDto {
  name?: string
  address?: string
  latitude?: number
  longitude?: number
}

/**
 * 获取常用地点列表
 */
export const getFavoriteLocations = () => {
  return request<FavoriteLocation[]>({
    url: '/favorite-locations',
    method: 'GET',
  })
}

/**
 * 创建常用地点
 */
export const createFavoriteLocation = (data: CreateFavoriteLocationDto) => {
  return request<FavoriteLocation>({
    url: '/favorite-locations',
    method: 'POST',
    data,
  })
}

/**
 * 更新常用地点
 */
export const updateFavoriteLocation = (id: number, data: UpdateFavoriteLocationDto) => {
  return request<FavoriteLocation>({
    url: `/favorite-locations/${id}`,
    method: 'PATCH',
    data,
  })
}

/**
 * 删除常用地点
 */
export const deleteFavoriteLocation = (id: number) => {
  return request({
    url: `/favorite-locations/${id}`,
    method: 'DELETE',
  })
}

/**
 * 使用次数 +1
 */
export const incrementFavoriteLocationUseCount = (id: number) => {
  return request({
    url: `/favorite-locations/${id}/increment`,
    method: 'POST',
  })
}
```

- [ ] **Step 2: 提交**

```bash
git add wechat-carpool-miniprogram/src/api/favorite-location.ts
git commit -m "feat: 创建常用地点 API"
```

---

## Task 11: 在 ride API 中添加历史行程接口

**Files:**
- Modify: `wechat-carpool-miniprogram/src/api/ride.ts`

- [ ] **Step 1: 添加历史行程接口**

在文件末尾添加:

```typescript
export interface RideHistory {
  id: number
  type: 'find-car' | 'find-passenger'
  departure: string
  departureLocation?: { latitude: number; longitude: number }
  destination: string
  destinationLocation?: { latitude: number; longitude: number }
  waypoints?: Array<{ latitude: number; longitude: number }>
  departureTime: string
  seats?: number
  price?: number
  note?: string
}

/**
 * 获取历史行程
 */
export const getRideHistory = (limit: number = 10) => {
  return request<RideHistory[]>({
    url: '/rides/history',
    method: 'GET',
    params: { limit },
  })
}
```

- [ ] **Step 2: 提交**

```bash
git add wechat-carpool-miniprogram/src/api/ride.ts
git commit -m "feat: 添加历史行程 API"
```

---

## Task 12: 创建 QuickActions 组件

**Files:**
- Create: `wechat-carpool-miniprogram/src/pages/publish/components/QuickActions.vue`

- [ ] **Step 1: 创建组件文件**

```vue
<template>
  <view v-if="hasHistory" class="quick-actions">
    <button
      class="quick-btn"
      :class="{ loaded: isLoaded }"
      @click="loadLastRide"
    >
      <text class="icon">🚀</text>
      <text>{{ isLoaded ? '已加载上次行程' : '使用上次行程' }}</text>
    </button>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  hasHistory: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  loadLastRide: []
}>()

const isLoaded = ref(false)

const loadLastRide = () => {
  if (isLoaded.value) return
  emit('loadLastRide')
  isLoaded.value = true
}
</script>

<style scoped>
.quick-actions {
  padding: 20rpx 30rpx;
  background: #fff;
  margin-bottom: 20rpx;
}

.quick-btn {
  width: 100%;
  height: 80rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 28rpx;
  border: none;
}

.quick-btn.loaded {
  background: #e0e0e0;
  color: #999;
}

.quick-btn .icon {
  margin-right: 10rpx;
  font-size: 32rpx;
}
</style>
```

- [ ] **Step 2: 提交**

```bash
git add wechat-carpool-miniprogram/src/pages/publish/components/QuickActions.vue
git commit -m "feat: 创建 QuickActions 组件"
```

---

## Task 13: 创建 HistoryRides 组件

**Files:**
- Create: `wechat-carpool-miniprogram/src/pages/publish/components/HistoryRides.vue`

- [ ] **Step 1: 创建组件文件**

```vue
<template>
  <view v-if="rides.length > 0" class="history-rides">
    <view class="section-title">历史行程</view>
    <view
      v-for="ride in rides"
      :key="ride.id"
      class="ride-card"
      :class="{ selected: selectedId === ride.id }"
      @click="selectRide(ride)"
    >
      <view class="ride-route">
        <text class="icon">📍</text>
        <text class="text">{{ ride.departure }}</text>
        <text class="arrow">→</text>
        <text class="icon">🎯</text>
        <text class="text">{{ ride.destination }}</text>
      </view>
      <view class="ride-info">
        <text class="date">{{ formatDate(ride.departureTime) }}</text>
        <text class="type">{{ ride.type === 'find-car' ? '找车' : '找乘客' }}</text>
      </view>
    </view>
    <view class="view-more" @click="viewMore">
      <text>查看更多历史 ›</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { RideHistory } from '../../../api/ride'

interface Props {
  rides: RideHistory[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  selectRide: [ride: RideHistory]
  viewMore: []
}>()

const selectedId = ref<number | null>(null)

const selectRide = (ride: RideHistory) => {
  selectedId.value = ride.id
  emit('selectRide', ride)
}

const viewMore = () => {
  emit('viewMore')
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}月${day}日`
}
</script>

<style scoped>
.history-rides {
  padding: 20rpx 30rpx;
  background: #fff;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
}

.ride-card {
  padding: 24rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  margin-bottom: 16rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s;
}

.ride-card.selected {
  border-color: #1890ff;
  background: #e6f7ff;
}

.ride-route {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.ride-route .icon {
  font-size: 24rpx;
  margin-right: 8rpx;
}

.ride-route .text {
  font-size: 26rpx;
  color: #333;
  max-width: 200rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ride-route .arrow {
  margin: 0 12rpx;
  color: #999;
  font-size: 24rpx;
}

.ride-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ride-info .date {
  font-size: 24rpx;
  color: #666;
}

.ride-info .type {
  font-size: 22rpx;
  color: #1890ff;
  padding: 4rpx 12rpx;
  background: #e6f7ff;
  border-radius: 4rpx;
}

.view-more {
  text-align: center;
  padding: 20rpx 0;
  color: #1890ff;
  font-size: 26rpx;
}
</style>
```

- [ ] **Step 2: 提交**

```bash
git add wechat-carpool-miniprogram/src/pages/publish/components/HistoryRides.vue
git commit -m "feat: 创建 HistoryRides 组件"
```

---

## Task 14: 创建常用地点管理页

**Files:**
- Create: `wechat-carpool-miniprogram/src/pages/profile/favorite-locations.vue`
- Modify: `wechat-carpool-miniprogram/src/pages.json`

- [ ] **Step 1: 创建常用地点管理页**

创建 `wechat-carpool-miniprogram/src/pages/profile/favorite-locations.vue`:

```vue
<template>
  <view class="favorite-locations-page">
    <view class="header">
      <button class="add-btn" @click="addLocation">
        <text class="icon">+</text>
        <text>添加常用地点</text>
      </button>
    </view>

    <view v-if="locations.length === 0" class="empty">
      <text class="empty-text">暂无常用地点</text>
      <text class="empty-hint">点击上方按钮添加</text>
    </view>

    <view v-else class="location-list">
      <view
        v-for="location in locations"
        :key="location.id"
        class="location-item"
      >
        <view class="location-icon">{{ getLocationIcon(location.name) }}</view>
        <view class="location-info">
          <text class="location-name">{{ location.name }}</text>
          <text class="location-address">{{ location.address }}</text>
          <text class="location-count">使用 {{ location.useCount }} 次</text>
        </view>
        <view class="location-actions">
          <button class="action-btn" @click="editLocation(location)">编辑</button>
          <button class="action-btn delete" @click="deleteLocation(location)">删除</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  getFavoriteLocations,
  deleteFavoriteLocation,
  type FavoriteLocation,
} from '../../api/favorite-location'

const locations = ref<FavoriteLocation[]>([])

onMounted(() => {
  loadLocations()
})

const loadLocations = async () => {
  try {
    locations.value = await getFavoriteLocations()
  } catch (error) {
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

const addLocation = () => {
  uni.chooseLocation({
    success: (res) => {
      uni.navigateTo({
        url: `/pages/profile/edit-favorite-location?address=${encodeURIComponent(res.address)}&latitude=${res.latitude}&longitude=${res.longitude}`,
      })
    },
  })
}

const editLocation = (location: FavoriteLocation) => {
  uni.navigateTo({
    url: `/pages/profile/edit-favorite-location?id=${location.id}&name=${encodeURIComponent(location.name)}&address=${encodeURIComponent(location.address)}`,
  })
}

const deleteLocation = async (location: FavoriteLocation) => {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除"${location.name}"吗?`,
    success: async (res) => {
      if (res.confirm) {
        try {
          await deleteFavoriteLocation(location.id)
          uni.showToast({ title: '删除成功', icon: 'success' })
          loadLocations()
        } catch (error) {
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    },
  })
}

const getLocationIcon = (name: string) => {
  if (name.includes('家')) return '🏠'
  if (name.includes('公司')) return '🏢'
  if (name.includes('学校')) return '🏫'
  if (name.includes('健身')) return '🏋️'
  if (name.includes('医院')) return '🏥'
  return '📍'
}
</script>

<style scoped>
.favorite-locations-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  padding: 30rpx;
  background: #fff;
  margin-bottom: 20rpx;
}

.add-btn {
  width: 100%;
  height: 80rpx;
  background: #1890ff;
  color: #fff;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  border: none;
}

.add-btn .icon {
  margin-right: 10rpx;
  font-size: 32rpx;
}

.empty {
  padding: 200rpx 0;
  text-align: center;
}

.empty-text {
  display: block;
  font-size: 28rpx;
  color: #999;
  margin-bottom: 20rpx;
}

.empty-hint {
  display: block;
  font-size: 24rpx;
  color: #ccc;
}

.location-list {
  padding: 0 30rpx;
}

.location-item {
  background: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
}

.location-icon {
  font-size: 48rpx;
  margin-right: 20rpx;
}

.location-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.location-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
}

.location-address {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.location-count {
  font-size: 22rpx;
  color: #999;
}

.location-actions {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  padding: 12rpx 24rpx;
  font-size: 24rpx;
  border-radius: 8rpx;
  border: 1rpx solid #d9d9d9;
  background: #fff;
  color: #333;
}

.action-btn.delete {
  color: #ff4d4f;
  border-color: #ff4d4f;
}
</style>
```

- [ ] **Step 2: 在 pages.json 中注册页面**

在 `pages.json` 的 pages 数组中添加:

```json
{
  "path": "pages/profile/favorite-locations",
  "style": {
    "navigationBarTitleText": "常用地点"
  }
}
```

- [ ] **Step 3: 提交**

```bash
git add wechat-carpool-miniprogram/src/pages/profile/favorite-locations.vue wechat-carpool-miniprogram/src/pages.json
git commit -m "feat: 创建常用地点管理页"
```

---

## Task 15: 集成组件到发布页

**Files:**
- Modify: `wechat-carpool-miniprogram/src/pages/publish/index.vue`

- [ ] **Step 1: 导入组件和 API**

在 `<script setup>` 部分添加:

```typescript
import { getRideHistory, type RideHistory } from '../../api/ride'
import { getFavoriteLocations, type FavoriteLocation } from '../../api/favorite-location'
import QuickActions from './components/QuickActions.vue'
import HistoryRides from './components/HistoryRides.vue'
```

- [ ] **Step 2: 添加状态变量**

```typescript
const historyRides = ref<RideHistory[]>([])
const favoriteLocations = ref<FavoriteLocation[]>([])
const hasHistory = ref(false)
```

- [ ] **Step 3: 在 onMounted 中加载数据**

```typescript
onMounted(async () => {
  try {
    // 加载历史行程
    const history = await getRideHistory(3)
    historyRides.value = history
    hasHistory.value = history.length > 0

    // 加载常用地点
    favoriteLocations.value = await getFavoriteLocations()
  } catch (error) {
    console.error('加载数据失败:', error)
  }
})
```

- [ ] **Step 4: 添加事件处理方法**

```typescript
const handleLoadLastRide = () => {
  if (historyRides.value.length > 0) {
    const lastRide = historyRides.value[0]
    fillFormFromHistory(lastRide)
  }
}

const handleSelectRide = (ride: RideHistory) => {
  fillFormFromHistory(ride)
}

const fillFormFromHistory = (ride: RideHistory) => {
  formData.value.type = ride.type
  formData.value.departure = ride.departure
  formData.value.departureLocation = ride.departureLocation
  formData.value.destination = ride.destination
  formData.value.destinationLocation = ride.destinationLocation
  formData.value.waypoints = ride.waypoints || []
  formData.value.seats = ride.seats || 1
  formData.value.price = ride.price
  formData.value.note = ride.note || ''
  // 出发时间保持空白
  selectedDate.value = ''
  selectedTime.value = ''
}

const handleViewMore = () => {
  // TODO: 打开历史行程抽屉
  uni.showToast({ title: '功能开发中', icon: 'none' })
}
```

- [ ] **Step 5: 在模板中添加组件**

在 `<view class="publish-page">` 内部,页面标题后添加:

```vue
<QuickActions
  :hasHistory="hasHistory"
  @loadLastRide="handleLoadLastRide"
/>

<HistoryRides
  :rides="historyRides"
  @selectRide="handleSelectRide"
  @viewMore="handleViewMore"
/>
```

- [ ] **Step 6: 提交**

```bash
git add wechat-carpool-miniprogram/src/pages/publish/index.vue
git commit -m "feat: 集成快捷操作和历史行程组件到发布页"
```

---

## Task 16: 端到端测试

**Files:**
- None (testing only)

- [ ] **Step 1: 测试常用地点管理**

1. 打开小程序,进入个人中心
2. 点击"常用地点"
3. 点击"添加常用地点",选择地图位置
4. 输入名称"家",保存
5. 验证列表中显示新添加的地点
6. 点击"编辑",修改名称为"我的家"
7. 点击"删除",确认删除

预期: 所有操作成功,数据正确显示

- [ ] **Step 2: 测试历史行程复用**

1. 先发布一条拼车信息
2. 返回发布页
3. 验证显示"使用上次行程"按钮
4. 点击按钮,验证表单自动填充(出发时间除外)
5. 修改出发时间,重新发布
6. 验证历史行程卡片显示最近2条记录

预期: 历史行程正确加载和填充

- [ ] **Step 3: 测试常用地点快速选择**

1. 在常用地点管理页添加"家"和"公司"
2. 进入发布页
3. 点击"出发地"输入框
4. 验证弹出地点选择器,显示常用地点快捷按钮
5. 点击"家",验证自动填充出发地
6. 发布行程
7. 返回常用地点管理页,验证"家"的使用次数 +1

预期: 常用地点正确显示和使用,使用次数正确统计

- [ ] **Step 4: 提交测试通过标记**

```bash
git commit --allow-empty -m "test: 端到端测试通过"
```

---

## 自审清单

### 1. 规范覆盖检查

- [x] 快速复用上次行程 - Task 15
- [x] 历史行程列表 - Task 13, 15
- [x] 常用地点管理 - Task 1-6, 14
- [x] 常用地点快速选择 - Task 14, 15
- [x] 使用次数统计 - Task 4
- [x] 后端 API - Task 1-9
- [x] 前端组件 - Task 12-15
- [x] 端到端测试 - Task 16

### 2. 占位符检查

- [x] 无 TBD/TODO
- [x] 所有代码块完整
- [x] 所有命令有预期输出

### 3. 类型一致性检查

- [x] FavoriteLocation 实体字段与 DTO 一致
- [x] API 接口与前端类型定义一致
- [x] 组件 Props 和 Emits 类型正确

---

## 实施说明

**预计工时**: 2-3 天
- 后端开发: 1 天
- 前端开发: 1-1.5 天
- 测试和调试: 0.5 天

**依赖关系**:
- Task 1-9 (后端) 可以独立完成
- Task 10-15 (前端) 依赖后端 API
- Task 16 (测试) 依赖所有功能完成

**风险提示**:
- 地理坐标匹配算法可能需要调优
- 小程序地图选点需要配置相应权限
- 历史行程数据量大时需要优化查询性能

---

**计划版本**: v1.0  
**创建日期**: 2026-04-21
