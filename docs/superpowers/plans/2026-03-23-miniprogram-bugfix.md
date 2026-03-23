# 微信小程序问题修复实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复微信拼车小程序的4个关键问题:下拉刷新、表单重置、路线图显示和聊天跳转

**Architecture:** 采用逐个修复策略,针对每个问题独立解决。前端修复3个问题(首页下拉刷新、发布页表单重置、聊天跳转),后端修复1个问题(API返回坐标数据)。

**Tech Stack:** Vue 3 + TypeScript + uni-app (前端), NestJS + TypeORM (后端)

---

## 文件结构

### 需要修改的文件

**前端:**
- `wechat-carpool-miniprogram/src/pages/home/index.vue` - 添加下拉刷新、onShow刷新、修复聊天跳转
- `wechat-carpool-miniprogram/src/pages/publish/index.vue` - 修复表单重置逻辑

**后端:**
- `backend/src/modules/ride/ride.service.ts` - 修改API返回数据结构,添加坐标字段

---

## Task 1: 修复首页下拉刷新卡住

**Files:**
- Modify: `wechat-carpool-miniprogram/src/pages/home/index.vue:99`

- [ ] **Step 1: 添加 onPullDownRefresh 导入**

在第99行的 import 语句中添加 `onPullDownRefresh`:

```typescript
import { ref, onMounted, onPullDownRefresh } from 'vue'
```

- [ ] **Step 2: 添加下拉刷新处理函数**

在 `onMounted` 之后添加下拉刷新处理函数:

```typescript
// 下拉刷新
onPullDownRefresh(() => {
  page.value = 1
  rideList.value = []
  hasMore.value = true
  loadRideList().finally(() => {
    uni.stopPullDownRefresh()
  })
})
```

- [ ] **Step 3: 测试下拉刷新功能**

在微信开发者工具中:
1. 打开首页
2. 下拉页面
3. 验证列表重新加载
4. 验证刷新动画正常停止

Expected: 下拉后列表刷新,动画停止,不卡住

- [ ] **Step 4: 提交修改**

```bash
git add wechat-carpool-miniprogram/src/pages/home/index.vue
git commit -m "fix: 修复首页下拉刷新卡住问题

添加 onPullDownRefresh 生命周期函数处理下拉刷新,
在 finally 块中调用 stopPullDownRefresh 停止刷新动画

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 2: 修复首页联系TA聊天跳转白屏

**Files:**
- Modify: `wechat-carpool-miniprogram/src/pages/home/index.vue:202-220`

- [ ] **Step 1: 修改 contactUser 函数的跳转路径**

找到 `contactUser` 函数(第202-220行),修改跳转路径:

```typescript
const contactUser = async (ride: HomeRide) => {
  const token = uni.getStorageSync('token')
  if (!token) {
    uni.navigateTo({ url: '/pages/login/index' })
    return
  }
  try {
    uni.showLoading({ title: '连接中...' })
    await timLogin()
    const res = await createConversation(Number(ride.userId))
    uni.hideLoading()
    uni.navigateTo({
      url: `/pages/chat/detail?conversationID=${res.conversationId}`,  // 修改此行
    })
  } catch (err) {
    uni.hideLoading()
    uni.showToast({ title: '无法发起聊天', icon: 'none' })
  }
}
```

- [ ] **Step 2: 测试聊天跳转功能**

在微信开发者工具中:
1. 打开首页
2. 点击任意拼车卡片的"联系TA"按钮
3. 验证跳转到聊天详情页
4. 验证页面正常显示,不白屏

Expected: 跳转到 `/pages/chat/detail` 页面,正常显示聊天界面

- [ ] **Step 3: 提交修改**

```bash
git add wechat-carpool-miniprogram/src/pages/home/index.vue
git commit -m "fix: 修复首页联系TA跳转聊天页白屏

将跳转路径从 /TUIKit/components/TUIChat/index
改为 /pages/chat/detail,与详情页保持一致

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 3: 添加首页 onShow 自动刷新

**Files:**
- Modify: `wechat-carpool-miniprogram/src/pages/home/index.vue:99,153-168`

- [ ] **Step 1: 添加 onShow 导入**

在第99行的 import 语句中添加 `onShow`:

```typescript
import { ref, onMounted, onPullDownRefresh, onShow } from 'vue'
```

- [ ] **Step 2: 添加 lastLoadTime 变量**

在 `onMounted` 之前添加:

```typescript
// 记录上次加载时间,用于 onShow 判断是否需要刷新
let lastLoadTime = 0
```

- [ ] **Step 3: 在 loadRideList 中更新时间戳**

修改 `loadRideList` 函数(第153-168行),在成功加载后更新时间戳:

```typescript
const loadRideList = async () => {
  if (loading.value || !hasMore.value) return
  loading.value = true

  try {
    const res = await getRideList({ type: activeTab.value, page: page.value, limit: 10 })
    const newItems = (res.list || []).map(formatRide)
    rideList.value.push(...newItems)
    hasMore.value = newItems.length >= 10
    lastLoadTime = Date.now()  // 新增:更新时间戳
  } catch (error) {
    console.error('加载失败', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}
```

- [ ] **Step 4: 添加 onShow 处理函数**

在 `onPullDownRefresh` 之后添加:

```typescript
// 页面显示时检查是否需要刷新
onShow(() => {
  const now = Date.now()
  // 如果距离上次加载超过5秒,则刷新列表
  if (now - lastLoadTime > 5000) {
    page.value = 1
    rideList.value = []
    hasMore.value = true
    loadRideList()
  }
})
```

- [ ] **Step 5: 测试 onShow 刷新功能**

在微信开发者工具中:
1. 打开首页
2. 切换到发布页,发布一条拼车信息
3. 等待跳转回首页
4. 验证首页列表自动刷新,显示新发布的信息

Expected: 从发布页返回首页后,列表自动刷新

- [ ] **Step 6: 提交修改**

```bash
git add wechat-carpool-miniprogram/src/pages/home/index.vue
git commit -m "feat: 添加首页 onShow 自动刷新功能

当从其他页面返回首页时,如果距离上次加载超过5秒,
自动刷新列表,确保显示最新数据

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 4: 修复发布页表单重置不完整

**Files:**
- Modify: `wechat-carpool-miniprogram/src/pages/publish/index.vue:441-458`

- [ ] **Step 1: 修改 resetForm 函数**

找到 `resetForm` 函数(第441-458行),添加日期时间重置逻辑:

```typescript
// 表单重置
const resetForm = () => {
  formData.type = 'find-car'
  formData.departure = ''
  formData.destination = ''
  formData.departureTime = ''
  formData.seats = undefined
  formData.price = undefined
  formData.note = ''
  formData.departureLocation = undefined
  formData.destinationLocation = undefined
  formData.waypoints = []

  // 新增:重置日期时间为当前时间
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  selectedDate.value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  selectedTime.value = `${pad(now.getHours())}:${pad(now.getMinutes())}`
  updateDepartureTime()

  // 清除所有错误
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })
}
```

- [ ] **Step 2: 测试表单重置功能**

在微信开发者工具中:
1. 打开发布页
2. 填写完整表单(包括选择日期时间)
3. 点击发布
4. 等待发布成功
5. 验证表单所有字段已重置
6. 验证日期时间重置为当前时间(而不是空白)

Expected: 发布成功后,表单完全重置,日期时间显示当前时间

- [ ] **Step 3: 提交修改**

```bash
git add wechat-carpool-miniprogram/src/pages/publish/index.vue
git commit -m "fix: 修复发布页表单重置不完整问题

在 resetForm 中添加日期时间重置逻辑,
将 selectedDate 和 selectedTime 重置为当前时间

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 5: 修复后端 API 返回坐标数据

**Files:**
- Modify: `backend/src/modules/ride/ride.service.ts:110-143,49-105`

- [ ] **Step 1: 修改 getRideById 方法返回数据**

找到 `getRideById` 方法(第110-143行),修改返回对象,添加坐标字段:

```typescript
async getRideById(id: number) {
  const ride = await this.rideRepository.findOne({
    where: { id },
    relations: ['user'],
  });

  if (!ride || ride.deletedAt) {
    throw new NotFoundException('拼车信息不存在');
  }

  // 增加浏览次数
  ride.viewCount += 1;
  await this.rideRepository.save(ride);

  return {
    id: ride.id,
    type: ride.type,
    departure: ride.departure,
    departureLocation: ride.departureLocation,  // 新增
    destination: ride.destination,
    destinationLocation: ride.destinationLocation,  // 新增
    waypoints: ride.waypoints,  // 新增
    departureTime: ride.departureTime,
    seats: ride.seats,
    price: ride.price,
    note: ride.note,
    status: ride.status,
    viewCount: ride.viewCount,
    createdAt: ride.createdAt,
    user: {
      id: ride.user.id,
      nickname: ride.user.nickname,
      avatar: ride.user.avatar,
      rating: ride.user.rating,
    },
  };
}
```

- [ ] **Step 2: 修改 findRides 方法返回数据**

找到 `findRides` 方法(第49-105行),在 `list` 映射中添加坐标字段:

```typescript
return {
  list: rides.map(ride => ({
    id: ride.id,
    type: ride.type,
    departure: ride.departure,
    departureLocation: ride.departureLocation,  // 新增
    destination: ride.destination,
    destinationLocation: ride.destinationLocation,  // 新增
    waypoints: ride.waypoints,  // 新增
    departureTime: ride.departureTime,
    seats: ride.seats,
    price: ride.price,
    note: ride.note,
    status: ride.status,
    viewCount: ride.viewCount,
    createdAt: ride.createdAt,
    user: {
      id: ride.user.id,
      nickname: ride.user.nickname,
      avatar: ride.user.avatar,
      rating: ride.user.rating,
    },
  })),
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
};
```

- [ ] **Step 3: 重启后端服务**

如果后端服务正在运行,需要重启以应用更改:

```bash
cd backend && npm run start:dev
```

Expected: 后端服务重启成功,监听端口正常

- [ ] **Step 4: 测试 API 返回数据**

使用 curl 或 Postman 测试 API:

```bash
curl http://localhost:3000/api/rides/1
```

Expected: 响应中包含 `departureLocation`, `destinationLocation`, `waypoints` 字段

- [ ] **Step 5: 测试前端地图显示**

在微信开发者工具中:
1. 发布一条带途径点的车找人信息
2. 从首页点击进入详情页
3. 验证地图正常显示
4. 验证出发地、途径点、目的地都有标记
5. 验证折线连接正确

Expected: 详情页地图正常显示所有路线点和折线

- [ ] **Step 6: 提交修改**

```bash
git add backend/src/modules/ride/ride.service.ts
git commit -m "fix: 修复后端 API 未返回坐标数据问题

在 getRideById 和 findRides 方法中添加
departureLocation, destinationLocation, waypoints 字段,
确保前端可以正确渲染地图路线

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 6: 集成测试

**Files:**
- Test: 所有修改的功能

- [ ] **Step 1: 测试下拉刷新**

1. 打开首页
2. 下拉页面
3. ✓ 验证列表重新加载
4. ✓ 验证刷新动画正常停止
5. ✓ 验证分页状态正确重置

- [ ] **Step 2: 测试发布流程**

1. 打开发布页
2. 填写完整表单
3. 点击发布
4. ✓ 验证发布成功提示
5. ✓ 验证表单完全重置(包括时间重置为当前)
6. ✓ 验证跳转首页后列表自动刷新
7. ✓ 验证新发布的信息出现在列表中

- [ ] **Step 3: 测试路线图显示**

1. 发布一条带途径点的车找人信息
2. 从首页点击进入详情页
3. ✓ 验证地图正常显示
4. ✓ 验证出发地标记正确
5. ✓ 验证途径点标记正确
6. ✓ 验证目的地标记正确
7. ✓ 验证折线连接所有点

- [ ] **Step 4: 测试聊天跳转**

1. 从首页点击"联系TA"
2. ✓ 验证跳转到聊天详情页
3. ✓ 验证页面正常显示,不白屏
4. ✓ 验证会话正常创建
5. 从详情页点击"联系车主"
6. ✓ 验证跳转到聊天详情页
7. ✓ 验证页面正常显示

- [ ] **Step 5: 测试错误处理**

1. 断开网络,测试下拉刷新失败
   - ✓ 验证显示错误提示
   - ✓ 验证刷新动画停止
   - ✓ 验证原有列表数据保持不变

2. 测试发布失败
   - ✓ 验证显示错误提示
   - ✓ 验证表单数据保留,不清空

3. 测试未登录时点击联系TA
   - ✓ 验证跳转到登录页

- [ ] **Step 6: 创建测试报告**

记录所有测试结果,确认所有功能正常:

```markdown
## 测试报告

**测试日期:** 2026-03-23
**测试环境:** 微信开发者工具

### 测试结果

- [x] 首页下拉刷新功能正常
- [x] 发布后表单完全重置
- [x] 发布后首页自动刷新
- [x] 带途径点的拼车详情页地图正常显示
- [x] 首页联系TA跳转正常
- [x] 详情页联系车主跳转正常
- [x] 所有错误情况都有友好提示

### 结论

所有4个问题已修复,功能测试通过。
```

---

## 总结

本实施计划包含6个任务:
1. 修复首页下拉刷新卡住
2. 修复首页联系TA聊天跳转白屏
3. 添加首页 onShow 自动刷新
4. 修复发布页表单重置不完整
5. 修复后端 API 返回坐标数据
6. 集成测试

每个任务都包含详细的步骤、代码示例和测试验证。遵循 TDD 原则,先测试后提交,确保每个修复都能正常工作。
