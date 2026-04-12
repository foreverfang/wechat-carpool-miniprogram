# Profile Page Improvement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 完善「我的」页面，去除实名认证，接通统计数据真实 API，新增我的评价、设置、意见反馈功能。

**Architecture:** 后端在 UserModule 中扩展统计/评价/设置接口，新建 FeedbackModule 处理意见反馈；前端新增 ratings.vue / settings.vue / feedback.vue 三个页面，statistics.vue 替换 mock 数据。

**Tech Stack:** NestJS 11 + TypeORM + MySQL（后端）；uni-app + Vue 3 Composition API（前端）

---

## 文件清单

### 后端（新建/修改）
| 操作 | 路径 | 职责 |
|------|------|------|
| Modify | `backend/src/database/entities/user.entity.ts` | 新增 `notifyRideMatch` 字段 |
| Modify | `backend/src/modules/user/user.service.ts` | 扩展 statistics、新增 ratings / settings 逻辑 |
| Modify | `backend/src/modules/user/user.controller.ts` | 新增 ratings / settings 路由 |
| Modify | `backend/src/modules/user/dto/user.dto.ts` | 新增 UpdateSettingsDto |
| Modify | `backend/src/modules/user/user.module.ts` | 注入 Rating / Order entity |
| Create | `backend/src/modules/feedback/feedback.entity.ts` | Feedback 实体 |
| Create | `backend/src/modules/feedback/feedback.service.ts` | 提交反馈逻辑 |
| Create | `backend/src/modules/feedback/feedback.controller.ts` | POST /feedback |
| Create | `backend/src/modules/feedback/feedback.module.ts` | FeedbackModule |
| Modify | `backend/src/app.module.ts` | 注册 FeedbackModule |

### 前端（新建/修改）
| 操作 | 路径 | 职责 |
|------|------|------|
| Modify | `wechat-carpool-miniprogram/src/pages/profile/index.vue` | 去除实名认证菜单，加意见反馈入口 |
| Modify | `wechat-carpool-miniprogram/src/pages/profile/statistics.vue` | 替换 mock 数据，接真实 API |
| Create | `wechat-carpool-miniprogram/src/pages/profile/ratings.vue` | 我的评价（收到/发出双 Tab） |
| Create | `wechat-carpool-miniprogram/src/pages/profile/settings.vue` | 设置页（编辑资料/通知/关于） |
| Create | `wechat-carpool-miniprogram/src/pages/profile/feedback.vue` | 意见反馈表单页 |
| Modify | `wechat-carpool-miniprogram/src/api/user.ts` | 新增 ratings / settings / statistics API |
| Create | `wechat-carpool-miniprogram/src/api/feedback.ts` | 新增 submitFeedback API |
| Modify | `wechat-carpool-miniprogram/src/pages.json` | 注册三个新页面路由 |

---

## Task 1：User 实体新增通知设置字段

**Files:**
- Modify: `backend/src/database/entities/user.entity.ts`

- [ ] **Step 1: 在 User 实体末尾新增字段**

在 `status` 字段后、`createdAt` 之前插入：

```typescript
@Column({ name: 'notify_ride_match', default: true })
notifyRideMatch: boolean;
```

完整字段上下文（定位用）：
```typescript
  @Column({
    type: 'enum',
    enum: ['active', 'disabled'],
    default: 'active',
  })
  status: string;

  // 新增 ↓
  @Column({ name: 'notify_ride_match', default: true })
  notifyRideMatch: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
```

- [ ] **Step 2: 重启后端，确认 TypeORM synchronize 自动加列**

后端使用 `npm run start:dev`，控制台应出现类似：
```
query: ALTER TABLE `users` ADD `notify_ride_match` tinyint NOT NULL DEFAULT 1
```

若未出现，检查 `database.config.ts` 中 `synchronize: true` 是否已开启。

- [ ] **Step 3: Commit**

```bash
cd backend
git add src/database/entities/user.entity.ts
git commit -m "feat: add notify_ride_match field to users table"
```

---

## Task 2：后端扩展统计接口（真实计算）

**Files:**
- Modify: `backend/src/modules/user/user.module.ts`
- Modify: `backend/src/modules/user/user.service.ts`

- [ ] **Step 1: user.module.ts 注入 Rating / Order entity**

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from '../../database/entities/user.entity';
import { Ride } from '../../database/entities/ride.entity';
import { Order } from '../../database/entities/order.entity';
import { Rating } from '../../database/entities/rating.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Ride, Order, Rating])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
```

- [ ] **Step 2: user.service.ts 在顶部注入 Order 和 Rating repository**

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { Ride } from '../../database/entities/ride.entity';
import { Order } from '../../database/entities/order.entity';
import { Rating } from '../../database/entities/rating.entity';
import { UpdateUserDto, UpdateSettingsDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Ride)
    private rideRepository: Repository<Ride>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Rating)
    private ratingRepository: Repository<Rating>,
  ) {}
```

- [ ] **Step 3: 替换 getUserStatistics 方法**

用以下完整方法替换 `user.service.ts` 中现有的 `getUserStatistics`：

```typescript
async getUserStatistics(userId: number) {
  const allRides = await this.rideRepository.find({ where: { userId } });
  const published = allRides.length;
  const completed = allRides.filter(r => r.status === 'closed').length;
  const findCar = allRides.filter(r => r.type === 'find-car').length;
  const findPassenger = allRides.filter(r => r.type === 'find-passenger').length;

  // 参与的订单（作为乘客）
  const joinedOrders = await this.orderRepository.find({
    where: { passengerId: userId, status: 'completed' as any },
  });

  // 服务总人数（发布行程的 completed 订单数）
  const driverOrders = await this.orderRepository.find({
    where: { driverId: userId, status: 'completed' as any },
  });

  const totalPeople = driverOrders.length + joinedOrders.length;

  // 总里程估算：每次行程按 30km 固定估算（无里程字段）
  const KM_PER_RIDE = 30;
  const totalDistance = completed * KM_PER_RIDE;

  // 减碳量：每 km 减碳 0.2kg（私家车 vs 拼车）
  const carbonReduction = parseFloat((totalDistance * 0.2).toFixed(1));

  // 热门路线 TOP5
  const routeMap = new Map<string, { departure: string; destination: string; count: number }>();
  for (const ride of allRides) {
    const key = `${ride.departure}→${ride.destination}`;
    if (routeMap.has(key)) {
      routeMap.get(key)!.count++;
    } else {
      routeMap.set(key, { departure: ride.departure, destination: ride.destination, count: 1 });
    }
  }
  const topRoutes = Array.from(routeMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // 成就徽章解锁规则
  const badges = [
    { id: '1', icon: '🌟', name: '新手上路', unlocked: published >= 1 },
    { id: '2', icon: '🚗', name: '老司机', unlocked: completed >= 5 },
    { id: '3', icon: '🌱', name: '环保达人', unlocked: carbonReduction >= 10 },
    { id: '4', icon: '👥', name: '社交达人', unlocked: totalPeople >= 10 },
    { id: '5', icon: '🏆', name: '拼车之王', unlocked: completed >= 20 },
    { id: '6', icon: '💯', name: '完美评分', unlocked: false }, // 需评价模块支持，暂保留
  ];

  return {
    published,
    completed,
    findCar,
    findPassenger,
    totalRides: published,
    totalDistance,
    totalPeople,
    carbonReduction,
    topRoutes,
    badges,
  };
}
```

- [ ] **Step 4: 确认后端编译无报错**

```bash
cd backend && npx tsc --noEmit
```

Expected: 无输出（无错误）

- [ ] **Step 5: Commit**

```bash
git add src/modules/user/user.module.ts src/modules/user/user.service.ts
git commit -m "feat: extend user statistics with real calculation logic"
```

---

## Task 3：后端新增评价查询接口

**Files:**
- Modify: `backend/src/modules/user/user.service.ts`
- Modify: `backend/src/modules/user/user.controller.ts`

- [ ] **Step 1: user.service.ts 新增两个评价查询方法**

在 `getUserStatistics` 之后追加：

```typescript
/** 收到的评价 */
async getReceivedRatings(userId: number) {
  const ratings = await this.ratingRepository.find({
    where: { toUserId: userId },
    order: { createdAt: 'DESC' },
  });
  return ratings.map(r => ({
    id: r.id,
    score: r.rating,
    comment: r.comment || '',
    createdAt: r.createdAt,
  }));
}

/** 我发出的评价 */
async getGivenRatings(userId: number) {
  const ratings = await this.ratingRepository.find({
    where: { fromUserId: userId },
    order: { createdAt: 'DESC' },
  });
  return ratings.map(r => ({
    id: r.id,
    score: r.rating,
    comment: r.comment || '',
    createdAt: r.createdAt,
  }));
}
```

- [ ] **Step 2: user.controller.ts 新增两个路由**

在 `getUserRides` 路由后追加：

```typescript
/** 收到的评价 */
@Get('ratings/received')
@ApiOperation({ summary: '收到的评价' })
@ApiResponse({ status: 200, description: '获取成功' })
async getReceivedRatings(@Request() req) {
  return this.userService.getReceivedRatings(req.user.id);
}

/** 我发出的评价 */
@Get('ratings/given')
@ApiOperation({ summary: '我发出的评价' })
@ApiResponse({ status: 200, description: '获取成功' })
async getGivenRatings(@Request() req) {
  return this.userService.getGivenRatings(req.user.id);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/modules/user/user.service.ts src/modules/user/user.controller.ts
git commit -m "feat: add received/given ratings query endpoints"
```

---

## Task 4：后端新增通知设置接口

**Files:**
- Modify: `backend/src/modules/user/dto/user.dto.ts`
- Modify: `backend/src/modules/user/user.service.ts`
- Modify: `backend/src/modules/user/user.controller.ts`

- [ ] **Step 1: dto/user.dto.ts 新增 UpdateSettingsDto**

在文件末尾追加：

```typescript
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional()
  @IsBoolean()
  notifyRideMatch?: boolean;
}
```

注意：`IsOptional`、`IsBoolean` 需与现有 `import` 合并：
```typescript
import { IsOptional, IsString, Length, IsNotEmpty, IsBoolean } from 'class-validator';
```

- [ ] **Step 2: user.service.ts 新增 updateSettings 方法**

```typescript
async updateSettings(userId: number, dto: UpdateSettingsDto) {
  const user = await this.userRepository.findOne({ where: { id: userId } });
  if (!user) throw new NotFoundException('用户不存在');

  if (dto.notifyRideMatch !== undefined) {
    user.notifyRideMatch = dto.notifyRideMatch;
  }
  await this.userRepository.save(user);

  return { notifyRideMatch: user.notifyRideMatch };
}
```

同时在 `getUserById` 的返回值中加入 `notifyRideMatch`：
```typescript
return {
  id: user.id,
  nickname: user.nickname,
  avatar: user.avatar,
  rating: user.rating,
  phone: user.phone,
  notifyRideMatch: user.notifyRideMatch,  // 新增
  createdAt: user.createdAt,
};
```

- [ ] **Step 3: user.controller.ts 新增设置路由**

```typescript
import { UpdateUserDto, VerifyIdentityDto, UpdateSettingsDto } from './dto/user.dto';

// 在 verifyIdentity 路由之后追加：
@Patch('settings')
@ApiOperation({ summary: '更新通知设置' })
@ApiResponse({ status: 200, description: '更新成功' })
async updateSettings(@Request() req, @Body() dto: UpdateSettingsDto) {
  return this.userService.updateSettings(req.user.id, dto);
}
```

- [ ] **Step 4: 编译检查**

```bash
cd backend && npx tsc --noEmit
```

Expected: 无输出

- [ ] **Step 5: Commit**

```bash
git add src/modules/user/dto/user.dto.ts src/modules/user/user.service.ts src/modules/user/user.controller.ts
git commit -m "feat: add notification settings endpoint"
```

---

## Task 5：后端新建意见反馈模块

**Files:**
- Create: `backend/src/modules/feedback/feedback.entity.ts`
- Create: `backend/src/modules/feedback/feedback.service.ts`
- Create: `backend/src/modules/feedback/feedback.controller.ts`
- Create: `backend/src/modules/feedback/feedback.module.ts`
- Modify: `backend/src/app.module.ts`

- [ ] **Step 1: 创建 feedback.entity.ts**

```typescript
// backend/src/modules/feedback/feedback.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('feedbacks')
export class Feedback {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', nullable: true })
  userId: number;

  @Column({
    type: 'enum',
    enum: ['suggestion', 'bug', 'other'],
    default: 'other',
  })
  type: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'contact_info', nullable: true, length: 100 })
  contactInfo: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
```

- [ ] **Step 2: 创建 feedback.service.ts**

```typescript
// backend/src/modules/feedback/feedback.service.ts
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
```

- [ ] **Step 3: 创建 feedback.controller.ts**

```typescript
// backend/src/modules/feedback/feedback.controller.ts
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
```

- [ ] **Step 4: 创建 feedback.module.ts**

```typescript
// backend/src/modules/feedback/feedback.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
import { Feedback } from './feedback.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Feedback])],
  controllers: [FeedbackController],
  providers: [FeedbackService],
})
export class FeedbackModule {}
```

- [ ] **Step 5: app.module.ts 注册 FeedbackModule**

```typescript
import { FeedbackModule } from './modules/feedback/feedback.module';

// imports 数组中追加：
FeedbackModule,
```

- [ ] **Step 6: 确认后端编译并自动建表**

```bash
cd backend && npx tsc --noEmit
```

Expected: 无输出。后端启动后控制台应出现：
```
query: CREATE TABLE `feedbacks` (...)
```

- [ ] **Step 7: Commit**

```bash
git add src/modules/feedback/ src/app.module.ts
git commit -m "feat: add feedback module with POST /feedback endpoint"
```

---

## Task 6：前端 API 层扩展

**Files:**
- Modify: `wechat-carpool-miniprogram/src/api/user.ts`
- Create: `wechat-carpool-miniprogram/src/api/feedback.ts`

- [ ] **Step 1: user.ts 新增三个 API 函数**

在文件末尾追加：

```typescript
// 获取收到的评价
export const getReceivedRatings = () => {
  return request<any[]>({
    url: '/users/ratings/received',
    method: 'GET'
  })
}

// 获取发出的评价
export const getGivenRatings = () => {
  return request<any[]>({
    url: '/users/ratings/given',
    method: 'GET'
  })
}

// 更新通知设置
export const updateSettings = (data: { notifyRideMatch?: boolean }) => {
  return request<{ notifyRideMatch: boolean }>({
    url: '/users/settings',
    method: 'PATCH',
    data
  })
}
```

- [ ] **Step 2: 新建 feedback.ts**

```typescript
// wechat-carpool-miniprogram/src/api/feedback.ts
import request from '@/utils/request'

export const submitFeedback = (data: {
  type: 'suggestion' | 'bug' | 'other'
  content: string
  contactInfo?: string
}) => {
  return request<{ message: string }>({
    url: '/feedback',
    method: 'POST',
    data
  })
}
```

- [ ] **Step 3: Commit**

```bash
cd wechat-carpool-miniprogram
git add src/api/user.ts src/api/feedback.ts
git commit -m "feat: add ratings/settings/feedback API functions"
```

---

## Task 7：前端 pages.json 注册新页面

**Files:**
- Modify: `wechat-carpool-miniprogram/src/pages.json`

- [ ] **Step 1: 在 pages 数组中 statistics 条目之后插入三条新路由**

```json
{
  "path": "pages/profile/ratings",
  "style": {
    "navigationBarTitleText": "我的评价"
  }
},
{
  "path": "pages/profile/settings",
  "style": {
    "navigationBarTitleText": "设置"
  }
},
{
  "path": "pages/profile/feedback",
  "style": {
    "navigationBarTitleText": "意见反馈"
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages.json
git commit -m "feat: register ratings/settings/feedback pages"
```

---

## Task 8：前端修改 profile/index.vue

**Files:**
- Modify: `wechat-carpool-miniprogram/src/pages/profile/index.vue`

- [ ] **Step 1: 去掉「实名认证」菜单项，加入「我的评价」和「意见反馈」入口**

替换第二个 `menu-section`（当前含实名认证 + 设置 + 退出登录）为：

```html
<!-- 功能菜单第一组：记录/统计/评价 -->
<view class="menu-section">
  <view class="menu-item" @click="navigateTo('/pages/profile/records')">
    <view class="menu-left">
      <text class="menu-icon">📋</text>
      <text class="menu-text">拼车记录</text>
    </view>
    <text class="menu-arrow">›</text>
  </view>

  <view class="menu-item" @click="navigateTo('/pages/profile/statistics')">
    <view class="menu-left">
      <text class="menu-icon">📊</text>
      <text class="menu-text">统计数据</text>
    </view>
    <text class="menu-arrow">›</text>
  </view>

  <view class="menu-item" @click="navigateTo('/pages/profile/ratings')">
    <view class="menu-left">
      <text class="menu-icon">⭐</text>
      <text class="menu-text">我的评价</text>
    </view>
    <text class="menu-arrow">›</text>
  </view>
</view>

<!-- 功能菜单第二组：设置/反馈/退出 -->
<view class="menu-section">
  <view class="menu-item" @click="navigateTo('/pages/profile/settings')">
    <view class="menu-left">
      <text class="menu-icon">⚙️</text>
      <text class="menu-text">设置</text>
    </view>
    <text class="menu-arrow">›</text>
  </view>

  <view class="menu-item" @click="navigateTo('/pages/profile/feedback')">
    <view class="menu-left">
      <text class="menu-icon">💬</text>
      <text class="menu-text">意见反馈</text>
    </view>
    <text class="menu-arrow">›</text>
  </view>

  <view class="menu-item" @click="handleLogout">
    <view class="menu-left">
      <text class="menu-icon">🚪</text>
      <text class="menu-text">退出登录</text>
    </view>
    <text class="menu-arrow">›</text>
  </view>
</view>
```

- [ ] **Step 2: 清理 script 中无用函数**

删除以下函数（已无对应入口）：
- `viewRatings`（之前用 showToast，现在直接 navigateTo）
- `handleAuth`
- `handleSettings`（改为 navigateTo）

确保 `navigateTo` 函数保留：
```typescript
const navigateTo = (url: string) => {
  uni.navigateTo({ url })
}
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/profile/index.vue
git commit -m "feat: update profile menu - remove auth, add ratings/settings/feedback"
```

---

## Task 9：前端 statistics.vue 接真实 API

**Files:**
- Modify: `wechat-carpool-miniprogram/src/pages/profile/statistics.vue`

- [ ] **Step 1: 替换 script 部分，接真实 API**

将 `<script setup lang="ts">` 整块替换为：

```typescript
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getUserStatistics } from '@/api/user'

interface StatItem {
  totalRides: number
  totalDistance: number
  totalPeople: number
  carbonReduction: number
  findCar: number
  findPassenger: number
}

interface Route {
  departure: string
  destination: string
  count: number
}

interface Badge {
  id: string
  icon: string
  name: string
  unlocked: boolean
}

const overview = ref<StatItem>({
  totalRides: 0,
  totalDistance: 0,
  totalPeople: 0,
  carbonReduction: 0,
  findCar: 0,
  findPassenger: 0,
})

const distribution = ref({ findCar: 0, findPassenger: 0, total: 0 })
const topRoutes = ref<Route[]>([])
const badges = ref<Badge[]>([])
const loading = ref(true)

const loadStatistics = async () => {
  try {
    const res = await getUserStatistics()
    const data = res as any
    overview.value = {
      totalRides: data.totalRides || 0,
      totalDistance: data.totalDistance || 0,
      totalPeople: data.totalPeople || 0,
      carbonReduction: data.carbonReduction || 0,
      findCar: data.findCar || 0,
      findPassenger: data.findPassenger || 0,
    }
    distribution.value = {
      findCar: data.findCar || 0,
      findPassenger: data.findPassenger || 0,
      total: (data.findCar || 0) + (data.findPassenger || 0),
    }
    topRoutes.value = data.topRoutes || []
    badges.value = data.badges || []
  } catch (error) {
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadStatistics()
})
</script>
```

- [ ] **Step 2: 更新 template 绑定字段**

将 overview-card 中四个 stat-item 的 `.value` 绑定更新：
```html
<text class="value">{{ overview.totalRides }}</text>
<text class="value">{{ overview.totalDistance }}km</text>
<text class="value">{{ overview.totalPeople }}</text>
<text class="value">{{ overview.carbonReduction }}kg</text>
```

将 distribution-list 绑定改为：
```html
<!-- 人找车 -->
<text class="value">{{ distribution.findCar }}</text>
<text class="percent">
  {{ distribution.total > 0 ? ((distribution.findCar / distribution.total) * 100).toFixed(0) : 0 }}%
</text>
<!-- 车找人 -->
<text class="value">{{ distribution.findPassenger }}</text>
<text class="percent">
  {{ distribution.total > 0 ? ((distribution.findPassenger / distribution.total) * 100).toFixed(0) : 0 }}%
</text>
```

注意：加 `distribution.total > 0` 判断防止除零。

- [ ] **Step 3: 新增空状态提示（无数据时）**

在 routes-list 后面加：
```html
<view v-if="topRoutes.length === 0" class="empty-hint">
  <text class="empty-text">暂无路线数据</text>
</view>
```

对应样式追加到 `<style scoped>`：
```scss
.empty-hint {
  padding: 40rpx 0;
  text-align: center;
  .empty-text {
    font-size: 26rpx;
    color: #999;
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/profile/statistics.vue
git commit -m "feat: connect statistics page to real API"
```

---

## Task 10：新建 profile/ratings.vue（我的评价）

**Files:**
- Create: `wechat-carpool-miniprogram/src/pages/profile/ratings.vue`

- [ ] **Step 1: 创建完整页面**

```vue
<template>
  <view class="ratings-container">
    <!-- Tab 切换 -->
    <view class="tab-bar">
      <view
        :class="['tab-item', activeTab === 'received' ? 'active' : '']"
        @click="switchTab('received')"
      >
        收到的评价
      </view>
      <view
        :class="['tab-item', activeTab === 'given' ? 'active' : '']"
        @click="switchTab('given')"
      >
        我发出的评价
      </view>
    </view>

    <!-- 评价列表 -->
    <scroll-view class="list" scroll-y>
      <view v-if="loading" class="loading-tip">
        <text>加载中...</text>
      </view>

      <view
        v-for="item in list"
        :key="item.id"
        class="rating-card"
      >
        <!-- 星级 -->
        <view class="stars">
          <text
            v-for="n in 5"
            :key="n"
            :class="['star', n <= item.score ? 'filled' : '']"
          >★</text>
          <text class="score-text">{{ item.score }}.0</text>
        </view>

        <!-- 评论 -->
        <text class="comment">{{ item.comment || '该用户未留下评论' }}</text>

        <!-- 时间 -->
        <text class="time">{{ formatDate(item.createdAt) }}</text>
      </view>

      <view v-if="!loading && list.length === 0" class="empty">
        <text class="empty-icon">⭐</text>
        <text class="empty-text">暂无{{ activeTab === 'received' ? '收到的' : '发出的' }}评价</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getReceivedRatings, getGivenRatings } from '@/api/user'

interface RatingItem {
  id: number
  score: number
  comment: string
  createdAt: string
}

const activeTab = ref<'received' | 'given'>('received')
const list = ref<RatingItem[]>([])
const loading = ref(false)

const loadData = async () => {
  loading.value = true
  try {
    const res = activeTab.value === 'received'
      ? await getReceivedRatings()
      : await getGivenRatings()
    list.value = (res as any[]) || []
  } catch {
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const switchTab = (tab: 'received' | 'given') => {
  activeTab.value = tab
  loadData()
}

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.ratings-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.tab-bar {
  display: flex;
  background-color: #fff;
  border-bottom: 1rpx solid #eee;

  .tab-item {
    flex: 1;
    text-align: center;
    padding: 28rpx 0;
    font-size: 28rpx;
    color: #666;
    position: relative;

    &.active {
      color: #1890FF;
      font-weight: bold;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 60rpx;
        height: 6rpx;
        background-color: #1890FF;
        border-radius: 3rpx;
      }
    }
  }
}

.list {
  height: calc(100vh - 100rpx);
  padding: 20rpx;
}

.loading-tip {
  padding: 60rpx;
  text-align: center;
  color: #999;
  font-size: 26rpx;
}

.rating-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);

  .stars {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;

    .star {
      font-size: 36rpx;
      color: #ddd;
      margin-right: 4rpx;

      &.filled {
        color: #faad14;
      }
    }

    .score-text {
      font-size: 26rpx;
      color: #faad14;
      margin-left: 12rpx;
      font-weight: bold;
    }
  }

  .comment {
    display: block;
    font-size: 28rpx;
    color: #333;
    line-height: 1.6;
    margin-bottom: 20rpx;
  }

  .time {
    font-size: 24rpx;
    color: #bbb;
  }
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 200rpx 0;

  .empty-icon {
    font-size: 100rpx;
    margin-bottom: 24rpx;
    opacity: 0.3;
  }

  .empty-text {
    font-size: 28rpx;
    color: #999;
  }
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/profile/ratings.vue
git commit -m "feat: add ratings page with received/given tabs"
```

---

## Task 11：新建 profile/settings.vue（设置）

**Files:**
- Create: `wechat-carpool-miniprogram/src/pages/profile/settings.vue`

- [ ] **Step 1: 创建完整页面**

```vue
<template>
  <view class="settings-container">
    <!-- 编辑个人资料 -->
    <view class="section">
      <view class="section-title">账号</view>
      <view class="menu-section">
        <view class="menu-item" @click="editProfile">
          <view class="menu-left">
            <text class="menu-icon">👤</text>
            <text class="menu-text">编辑个人资料</text>
          </view>
          <text class="menu-arrow">›</text>
        </view>
      </view>
    </view>

    <!-- 通知设置 -->
    <view class="section">
      <view class="section-title">通知</view>
      <view class="menu-section">
        <view class="menu-item">
          <view class="menu-left">
            <text class="menu-icon">🔔</text>
            <text class="menu-text">拼车匹配通知</text>
          </view>
          <switch
            :checked="notifyRideMatch"
            color="#1890FF"
            @change="onNotifyChange"
          />
        </view>
      </view>
    </view>

    <!-- 关于 -->
    <view class="section">
      <view class="section-title">关于</view>
      <view class="menu-section">
        <view class="menu-item">
          <view class="menu-left">
            <text class="menu-icon">ℹ️</text>
            <text class="menu-text">当前版本</text>
          </view>
          <text class="version-text">v1.0.0</text>
        </view>

        <view class="menu-item" @click="contactUs">
          <view class="menu-left">
            <text class="menu-icon">📧</text>
            <text class="menu-text">联系我们</text>
          </view>
          <text class="menu-arrow">›</text>
        </view>

        <view class="menu-item" @click="showPrivacy">
          <view class="menu-left">
            <text class="menu-icon">🔒</text>
            <text class="menu-text">隐私政策</text>
          </view>
          <text class="menu-arrow">›</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getUserInfo, updateSettings } from '@/api/user'

const notifyRideMatch = ref(true)

const loadSettings = async () => {
  try {
    const res = await getUserInfo()
    notifyRideMatch.value = (res as any).notifyRideMatch ?? true
  } catch {
    // 静默失败，使用默认值
  }
}

const onNotifyChange = async (e: any) => {
  const value = e.detail.value
  notifyRideMatch.value = value
  try {
    await updateSettings({ notifyRideMatch: value })
    uni.showToast({ title: '设置已保存', icon: 'success' })
  } catch {
    // 回滚开关状态
    notifyRideMatch.value = !value
    uni.showToast({ title: '保存失败', icon: 'none' })
  }
}

const editProfile = () => {
  uni.showModal({
    title: '编辑资料',
    content: '昵称修改功能即将上线',
    showCancel: false,
  })
}

const contactUs = () => {
  uni.showModal({
    title: '联系我们',
    content: '邮箱：support@carpool.com',
    showCancel: false,
  })
}

const showPrivacy = () => {
  uni.showToast({ title: '隐私政策', icon: 'none' })
}

onMounted(() => {
  loadSettings()
})
</script>

<style scoped lang="scss">
.settings-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 40rpx;
}

.section {
  margin-top: 24rpx;

  .section-title {
    font-size: 24rpx;
    color: #999;
    padding: 0 32rpx 12rpx;
  }
}

.menu-section {
  background-color: #fff;
  overflow: hidden;

  .menu-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 32rpx 24rpx;
    border-bottom: 1rpx solid #eee;

    &:last-child {
      border-bottom: none;
    }

    .menu-left {
      display: flex;
      align-items: center;

      .menu-icon {
        font-size: 40rpx;
        margin-right: 20rpx;
      }

      .menu-text {
        font-size: 28rpx;
        color: #333;
      }
    }

    .menu-arrow {
      font-size: 40rpx;
      color: #ccc;
    }

    .version-text {
      font-size: 26rpx;
      color: #999;
    }
  }
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/profile/settings.vue
git commit -m "feat: add settings page with notification toggle and about section"
```

---

## Task 12：新建 profile/feedback.vue（意见反馈）

**Files:**
- Create: `wechat-carpool-miniprogram/src/pages/profile/feedback.vue`

- [ ] **Step 1: 创建完整页面**

```vue
<template>
  <view class="feedback-container">
    <!-- 反馈类型 -->
    <view class="form-card">
      <view class="form-label">反馈类型</view>
      <view class="type-group">
        <view
          v-for="t in types"
          :key="t.value"
          :class="['type-item', form.type === t.value ? 'active' : '']"
          @click="form.type = t.value"
        >
          <text class="type-icon">{{ t.icon }}</text>
          <text class="type-text">{{ t.label }}</text>
        </view>
      </view>
    </view>

    <!-- 反馈内容 -->
    <view class="form-card">
      <view class="form-label">反馈内容 <text class="required">*</text></view>
      <textarea
        class="textarea"
        v-model="form.content"
        placeholder="请详细描述您的问题或建议（最多 200 字）"
        :maxlength="200"
        auto-height
      />
      <text class="word-count">{{ form.content.length }}/200</text>
    </view>

    <!-- 联系方式（可选） -->
    <view class="form-card">
      <view class="form-label">联系方式 <text class="optional">（选填）</text></view>
      <input
        class="input"
        v-model="form.contactInfo"
        placeholder="手机号或微信，方便我们回复您"
        :maxlength="50"
      />
    </view>

    <!-- 提交按钮 -->
    <view class="submit-area">
      <button class="submit-btn" :loading="submitting" @click="submit">
        提交反馈
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { submitFeedback } from '@/api/feedback'

const types = [
  { value: 'suggestion', label: '功能建议', icon: '💡' },
  { value: 'bug', label: '问题反馈', icon: '🐛' },
  { value: 'other', label: '其他', icon: '💬' },
]

const form = ref({
  type: 'suggestion' as 'suggestion' | 'bug' | 'other',
  content: '',
  contactInfo: '',
})

const submitting = ref(false)

const submit = async () => {
  if (!form.value.content.trim()) {
    uni.showToast({ title: '请填写反馈内容', icon: 'none' })
    return
  }

  submitting.value = true
  try {
    await submitFeedback({
      type: form.value.type,
      content: form.value.content.trim(),
      contactInfo: form.value.contactInfo.trim() || undefined,
    })
    uni.showToast({ title: '提交成功，感谢您的反馈！', icon: 'success' })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch {
    uni.showToast({ title: '提交失败，请重试', icon: 'none' })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
.feedback-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx;
}

.form-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);

  .form-label {
    font-size: 28rpx;
    color: #333;
    font-weight: bold;
    margin-bottom: 24rpx;

    .required {
      color: #ff4d4f;
      margin-left: 4rpx;
    }

    .optional {
      font-size: 24rpx;
      color: #999;
      font-weight: normal;
    }
  }
}

.type-group {
  display: flex;
  gap: 20rpx;

  .type-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24rpx 0;
    background-color: #f5f5f5;
    border-radius: 12rpx;
    border: 2rpx solid transparent;

    &.active {
      background-color: #e6f4ff;
      border-color: #1890FF;
    }

    .type-icon {
      font-size: 48rpx;
      margin-bottom: 8rpx;
    }

    .type-text {
      font-size: 24rpx;
      color: #666;
    }
  }
}

.textarea {
  width: 100%;
  min-height: 240rpx;
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
  box-sizing: border-box;
}

.word-count {
  display: block;
  text-align: right;
  font-size: 22rpx;
  color: #bbb;
  margin-top: 12rpx;
}

.input {
  width: 100%;
  height: 80rpx;
  font-size: 28rpx;
  color: #333;
  border-bottom: 1rpx solid #eee;
  box-sizing: border-box;
}

.submit-area {
  padding: 20rpx 0 40rpx;

  .submit-btn {
    width: 100%;
    height: 96rpx;
    background-color: #1890FF;
    color: #fff;
    border-radius: 48rpx;
    font-size: 32rpx;
    border: none;
    line-height: 96rpx;
  }
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/profile/feedback.vue
git commit -m "feat: add feedback form page"
```

---

## 自查清单

- [x] 实名认证：profile/index.vue 中删除 `handleAuth` 菜单入口
- [x] 统计数据：后端计算 totalDistance / totalPeople / carbonReduction / topRoutes / badges，前端替换 mock
- [x] 我的评价：`GET /users/ratings/received` + `GET /users/ratings/given`，新建 ratings.vue 双 Tab
- [x] 设置页：通知设置存库（notifyRideMatch 字段），编辑资料、关于我们静态展示
- [x] 意见反馈：新建 FeedbackModule + `POST /feedback`，新建 feedback.vue 表单
- [x] pages.json 注册三个新页面
- [x] API 层全部扩展完整
- [x] 所有除零判断（distribution.total > 0）
- [x] 小程序 v-for :key 不使用字符串拼接
