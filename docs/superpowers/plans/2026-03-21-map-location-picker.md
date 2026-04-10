# 地图选点与路线展示 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在发布页用地图选点替换文字输入，车找人支持途径点，乘客可在详情页查看路线地图。

**Architecture:** 调用 uni-app `uni.chooseLocation`（微信小程序编译为 `wx.chooseLocation`）选点，坐标随表单提交后端；新建详情页用 `<map>` 组件 + polyline 展示路线；首页卡片点击跳转详情页。

**Tech Stack:** uni-app Vue3 + TypeScript，`uni.chooseLocation` API，uni-app `<map>` 组件

---

## 文件清单

| 操作 | 文件 |
|------|------|
| 修改 | `wechat-carpool-miniprogram/src/manifest.json` |
| 修改 | `wechat-carpool-miniprogram/src/types/index.ts` |
| 修改 | `wechat-carpool-miniprogram/src/pages/publish/index.vue` |
| 新建 | `wechat-carpool-miniprogram/src/pages/ride/detail.vue` |
| 修改 | `wechat-carpool-miniprogram/src/pages.json` |
| 修改 | `wechat-carpool-miniprogram/src/pages/home/index.vue` |

---

## Task 1: 配置地理位置权限

**Files:**
- Modify: `wechat-carpool-miniprogram/src/manifest.json:52-58`

- [ ] **Step 1: 在 mp-weixin 节点添加 permission 声明**

```json
"mp-weixin" : {
    "appid" : "",
    "setting" : {
        "urlCheck" : false
    },
    "usingComponents" : true,
    "permission": {
        "scope.userLocation": {
            "desc": "选择出发地和目的地需要获取您的位置信息"
        }
    }
},
```

- [ ] **Step 2: 验证 JSON 格式正确**

打开文件确认无语法错误。

- [ ] **Step 3: Commit**

```bash
git add wechat-carpool-miniprogram/src/manifest.json
git commit -m "chore: 添加地理位置权限声明"
```

---

## Task 2: 更新类型定义

**Files:**
- Modify: `wechat-carpool-miniprogram/src/types/index.ts`

- [ ] **Step 1: 新增 LocationPoint 接口，扩展 Ride 和 PublishRideParams**

在文件顶部 `RideType` 前添加：
```ts
export interface LocationPoint {
  name: string
  latitude: number
  longitude: number
}
```

将 `Ride` 接口中的 `departureLocation` 和 `destinationLocation` 的内联类型替换为 `LocationPoint`，并补充 `waypoints`：

```ts
// 将原有的内联类型
departureLocation: {
  latitude: number
  longitude: number
}
// 替换为：
departureLocation: LocationPoint

// 同理 destinationLocation
destinationLocation: LocationPoint

// 补充 waypoints 字段
waypoints?: LocationPoint[]
```

即将 `Ride` 中两处 `{ latitude: number; longitude: number }` 内联对象类型统一改为 `LocationPoint`，这样 `name` 字段也被包含，与 `allPoints` computed 的期望类型一致。

将 `PublishRideParams` 替换为：
```ts
export interface PublishRideParams {
  type: RideType
  departure: string
  departureLocation?: LocationPoint
  destination: string
  destinationLocation?: LocationPoint
  waypoints?: LocationPoint[]
  departureTime: string
  seats?: number
  price?: number
  note?: string
}
```

- [ ] **Step 2: Commit**

```bash
git add wechat-carpool-miniprogram/src/types/index.ts
git commit -m "feat: 新增 LocationPoint 类型，扩展 Ride 和 PublishRideParams"
```

---

## Task 3: 修改发布页 - 地图选点

**Files:**
- Modify: `wechat-carpool-miniprogram/src/pages/publish/index.vue`

- [ ] **Step 1: 替换出发地 input 为可点击 view**

将出发地 `<view class="form-section">` 内的 `<input>` 替换为：

```html
<!-- 出发地 -->
<view class="form-section">
  <view class="section-title">
    <text class="required">*</text>
    <text>出发地</text>
  </view>
  <view class="location-picker" @click="chooseLocation('departure')">
    <text class="location-icon">📍</text>
    <text :class="formData.departure ? 'location-text' : 'location-placeholder'">
      {{ formData.departure || '点击选择出发地' }}
    </text>
    <text class="location-arrow">›</text>
  </view>
  <text v-if="errors.departure" class="error-text">{{ errors.departure }}</text>
</view>
```

- [ ] **Step 2: 替换目的地 input 为可点击 view**

将目的地 `<view class="form-section">` 内的 `<input>` 替换为：

```html
<!-- 目的地 -->
<view class="form-section">
  <view class="section-title">
    <text class="required">*</text>
    <text>目的地</text>
  </view>
  <view class="location-picker" @click="chooseLocation('destination')">
    <text class="location-icon">📍</text>
    <text :class="formData.destination ? 'location-text' : 'location-placeholder'">
      {{ formData.destination || '点击选择目的地' }}
    </text>
    <text class="location-arrow">›</text>
  </view>
  <text v-if="errors.destination" class="error-text">{{ errors.destination }}</text>
</view>
```

- [ ] **Step 3: 在目的地区块后添加途径点区块**

在目的地 `</view>` 后、出发时间 `<view class="form-section">` 前插入：

```html
<!-- 途径点（仅车找人） -->
<view class="form-section" v-if="formData.type === 'find-passenger'">
  <view class="section-title">
    <text>途径点（可选，最多3个）</text>
  </view>
  <view
    v-for="(wp, index) in formData.waypoints"
    :key="index"
    class="waypoint-item"
  >
    <text class="location-icon">🔵</text>
    <text class="location-text">{{ wp.name }}</text>
    <text class="waypoint-delete" @click="removeWaypoint(index)">✕</text>
  </view>
  <view
    class="add-waypoint-btn"
    :class="{ disabled: (formData.waypoints?.length ?? 0) >= 3 }"
    @click="addWaypoint"
  >
    <text>+ 添加途径点</text>
  </view>
</view>
```

- [ ] **Step 4: 在 script 中添加坐标状态和方法**

在 `formData` reactive 声明中补充坐标字段（修改 `reactive<PublishRideParams>` 初始值）：

```ts
const formData = reactive<PublishRideParams>({
  type: 'find-car',
  departure: '',
  departureLocation: undefined,
  destination: '',
  destinationLocation: undefined,
  waypoints: [],
  departureTime: '',
  seats: undefined,
  price: undefined,
  note: ''
})
```

添加 `chooseLocation`、`addWaypoint`、`removeWaypoint` 方法（在 `onTypeChange` 前）：

```ts
// 地图选点（uni.chooseLocation 在微信小程序中编译为 wx.chooseLocation）
const chooseLocation = (field: 'departure' | 'destination') => {
  uni.chooseLocation({
    success: (res) => {
      if (field === 'departure') {
        formData.departure = res.name || res.address
        formData.departureLocation = {
          name: res.name || res.address,
          latitude: res.latitude,
          longitude: res.longitude
        }
      } else {
        formData.destination = res.name || res.address
        formData.destinationLocation = {
          name: res.name || res.address,
          latitude: res.latitude,
          longitude: res.longitude
        }
      }
      validateField(field)
    },
    fail: (err) => {
      if (!err.errMsg?.includes('cancel')) {
        uni.showToast({ title: '获取位置失败，请检查定位权限', icon: 'none' })
      }
    }
  })
}

// 添加途径点
const addWaypoint = () => {
  if ((formData.waypoints?.length ?? 0) >= 3) return
  uni.chooseLocation({
    success: (res) => {
      if (!formData.waypoints) formData.waypoints = []
      formData.waypoints.push({
        name: res.name || res.address,
        latitude: res.latitude,
        longitude: res.longitude
      })
    },
    fail: (err) => {
      if (!err.errMsg?.includes('cancel')) {
        uni.showToast({ title: '获取位置失败，请检查定位权限', icon: 'none' })
      }
    }
  })
}

// 删除途径点
const removeWaypoint = (index: number) => {
  formData.waypoints?.splice(index, 1)
}
```

- [ ] **Step 5: 更新验证逻辑**

将 `validateField` 中 `departure` / `destination` 的 case 替换为：

```ts
case 'departure':
case 'destination':
  if (!formData[field]) {
    errors[field] = '请通过地图选择地点'
  }
  break
```

- [ ] **Step 6: 更新 resetForm，清空坐标**

在 `resetForm` 中补充：

```ts
formData.departureLocation = undefined
formData.destinationLocation = undefined
formData.waypoints = []
```

- [ ] **Step 7: 添加样式**

在 `<style>` 中添加：

```scss
.location-picker {
  display: flex;
  align-items: center;
  padding: 24rpx 20rpx;
  background: #F5F5F5;
  border-radius: 12rpx;
  min-height: 80rpx;

  .location-icon {
    font-size: 32rpx;
    margin-right: 12rpx;
  }

  .location-text {
    flex: 1;
    font-size: 28rpx;
    color: #333;
  }

  .location-placeholder {
    flex: 1;
    font-size: 28rpx;
    color: #BFBFBF;
  }

  .location-arrow {
    font-size: 36rpx;
    color: #BFBFBF;
  }
}

.waypoint-item {
  display: flex;
  align-items: center;
  padding: 16rpx 20rpx;
  background: #F5F5F5;
  border-radius: 12rpx;
  margin-bottom: 12rpx;

  .location-icon {
    font-size: 28rpx;
    margin-right: 12rpx;
  }

  .location-text {
    flex: 1;
    font-size: 28rpx;
    color: #333;
  }

  .waypoint-delete {
    font-size: 28rpx;
    color: #999;
    padding: 0 8rpx;
  }
}

.add-waypoint-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx;
  border: 2rpx dashed #1890FF;
  border-radius: 12rpx;
  color: #1890FF;
  font-size: 28rpx;

  &.disabled {
    border-color: #D9D9D9;
    color: #BFBFBF;
  }
}
```

- [ ] **Step 8: Commit**

```bash
git add wechat-carpool-miniprogram/src/pages/publish/index.vue
git commit -m "feat: 发布页出发地/目的地改为地图选点，车找人支持途径点"
```

---

## Task 4: 新建拼车详情页

**Files:**
- Create: `wechat-carpool-miniprogram/src/pages/ride/detail.vue`

- [ ] **Step 1: 创建详情页文件**

```vue
<template>
  <view class="detail-page">
    <!-- 地图区域（有坐标时显示） -->
    <map
      v-if="hasMapData"
      class="route-map"
      :latitude="mapCenter.latitude"
      :longitude="mapCenter.longitude"
      :scale="12"
      :markers="mapMarkers"
      :polyline="mapPolyline"
    />

    <!-- 无坐标时的占位 -->
    <view v-else class="map-placeholder">
      <text>暂无路线地图</text>
    </view>

    <!-- 详情内容 -->
    <view class="detail-content" v-if="ride">
      <!-- 用户信息 -->
      <view class="user-section">
        <image v-if="ride.avatar" :src="ride.avatar" class="avatar" />
        <view v-else class="avatar-placeholder"><text>👤</text></view>
        <view class="user-info">
          <text class="username">{{ ride.username }}</text>
          <view class="rating">
            <text class="star">⭐</text>
            <text class="score">{{ ride.rating }}</text>
          </view>
        </view>
        <view :class="['type-badge', ride.type]">
          {{ ride.type === 'find-car' ? '人找车' : '车找人' }}
        </view>
      </view>

      <!-- 路线信息 -->
      <view class="route-section">
        <view class="route-item">
          <text class="route-dot departure">●</text>
          <text class="route-text">{{ ride.departure }}</text>
        </view>
        <view
          v-for="(wp, index) in ride.waypoints"
          :key="index"
          class="route-item"
        >
          <text class="route-dot waypoint">●</text>
          <text class="route-text">{{ wp.name }}</text>
        </view>
        <view class="route-item">
          <text class="route-dot destination">●</text>
          <text class="route-text">{{ ride.destination }}</text>
        </view>
      </view>

      <!-- 基本信息 -->
      <view class="info-section">
        <view class="info-item">
          <text class="info-label">出发时间</text>
          <text class="info-value">{{ ride.departureTime }}</text>
        </view>
        <view class="info-item" v-if="ride.seats">
          <text class="info-label">座位数</text>
          <text class="info-value">{{ ride.seats }} 人</text>
        </view>
        <view class="info-item" v-if="ride.price">
          <text class="info-label">价格</text>
          <text class="info-value">¥{{ ride.price }}</text>
        </view>
        <view class="info-item" v-if="ride.note">
          <text class="info-label">备注</text>
          <text class="info-value">{{ ride.note }}</text>
        </view>
      </view>
    </view>

    <!-- 加载中 -->
    <view v-if="loading" class="loading">
      <text>加载中...</text>
    </view>

    <!-- 联系车主按钮 -->
    <view class="action-bar" v-if="ride && !isOwner">
      <button class="contact-btn" @click="contactOwner">联系车主</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getRideDetail } from '@/api/ride'
import type { Ride } from '@/types'

const ride = ref<Ride | null>(null)
const loading = ref(false)

// 当前用户 ID（从本地存储获取）
const currentUserId = uni.getStorageSync('userId') || ''
const isOwner = computed(() => ride.value?.userId === currentUserId)

onLoad(async (options) => {
  const id = options?.id
  if (!id) return
  loading.value = true
  try {
    const res = await getRideDetail(id)
    ride.value = res.data
  } catch {
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
})

// 是否有地图数据
const hasMapData = computed(() =>
  !!ride.value?.departureLocation?.latitude &&
  !!ride.value?.destinationLocation?.latitude
)

// 所有路线点
const allPoints = computed(() => {
  if (!hasMapData.value || !ride.value) return []
  return [
    ride.value.departureLocation!,
    ...(ride.value.waypoints ?? []),
    ride.value.destinationLocation!
  ]
})

// 地图中心
const mapCenter = computed(() => {
  const pts = allPoints.value
  if (!pts.length) return { latitude: 39.9, longitude: 116.4 }
  return {
    latitude: pts.reduce((s, p) => s + p.latitude, 0) / pts.length,
    longitude: pts.reduce((s, p) => s + p.longitude, 0) / pts.length
  }
})

// 地图标记
const mapMarkers = computed(() => {
  if (!hasMapData.value || !ride.value) return []
  const markers: any[] = []
  const dep = ride.value.departureLocation!
  markers.push({
    id: 0,
    latitude: dep.latitude,
    longitude: dep.longitude,
    callout: { content: '出发地', display: 'ALWAYS', fontSize: 12, borderRadius: 4, padding: 4 }
  })
  ride.value.waypoints?.forEach((wp, i) => {
    markers.push({
      id: i + 1,
      latitude: wp.latitude,
      longitude: wp.longitude,
      callout: { content: `途径点${i + 1}`, display: 'ALWAYS', fontSize: 12, borderRadius: 4, padding: 4 }
    })
  })
  const dest = ride.value.destinationLocation!
  markers.push({
    id: 99,
    latitude: dest.latitude,
    longitude: dest.longitude,
    callout: { content: '目的地', display: 'ALWAYS', fontSize: 12, borderRadius: 4, padding: 4 }
  })
  return markers
})

// 折线
const mapPolyline = computed(() => {
  const pts = allPoints.value
  if (pts.length < 2) return []
  return [{
    points: pts.map(p => ({ latitude: p.latitude, longitude: p.longitude })),
    color: '#1890FF',
    width: 4
  }]
})

// 联系车主
const contactOwner = () => {
  if (!ride.value) return
  uni.navigateTo({
    url: `/TUIKit/components/TUIChat/index?conversationID=C2C${ride.value.userId}`
  })
}
</script>

<style lang="scss">
.detail-page {
  min-height: 100vh;
  background: #F5F5F5;
  padding-bottom: 120rpx;
}

.route-map {
  width: 100%;
  height: 400rpx;
}

.map-placeholder {
  width: 100%;
  height: 200rpx;
  background: #E8E8E8;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 28rpx;
}

.detail-content {
  padding: 24rpx;
}

.user-section {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;

  .avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
  }

  .avatar-placeholder {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    background: #F0F0F0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40rpx;
  }

  .user-info {
    flex: 1;
    margin-left: 16rpx;

    .username {
      font-size: 30rpx;
      font-weight: bold;
      color: #333;
    }

    .rating {
      display: flex;
      align-items: center;
      margin-top: 4rpx;

      .star { font-size: 24rpx; }
      .score { font-size: 24rpx; color: #666; margin-left: 4rpx; }
    }
  }

  .type-badge {
    padding: 6rpx 16rpx;
    border-radius: 20rpx;
    font-size: 24rpx;

    &.find-car { background: #E6F7FF; color: #1890FF; }
    &.find-passenger { background: #F6FFED; color: #52C41A; }
  }
}

.route-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;

  .route-item {
    display: flex;
    align-items: center;
    padding: 12rpx 0;

    .route-dot {
      font-size: 20rpx;
      margin-right: 16rpx;

      &.departure { color: #52C41A; }
      &.waypoint { color: #1890FF; }
      &.destination { color: #FF4D4F; }
    }

    .route-text {
      font-size: 28rpx;
      color: #333;
    }
  }
}

.info-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;

  .info-item {
    display: flex;
    justify-content: space-between;
    padding: 16rpx 0;
    border-bottom: 1rpx solid #F0F0F0;

    &:last-child { border-bottom: none; }

    .info-label { font-size: 28rpx; color: #999; }
    .info-value { font-size: 28rpx; color: #333; }
  }
}

.loading {
  display: flex;
  justify-content: center;
  padding: 60rpx;
  color: #999;
  font-size: 28rpx;
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 48rpx;
  background: #fff;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.08);

  .contact-btn {
    width: 100%;
    height: 88rpx;
    background: #1890FF;
    color: #fff;
    border-radius: 44rpx;
    font-size: 32rpx;
    font-weight: bold;
    border: none;
    line-height: 88rpx;
  }
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add wechat-carpool-miniprogram/src/pages/ride/detail.vue
git commit -m "feat: 新建拼车详情页，含地图路线展示"
```

---

## Task 5: 注册路由

**Files:**
- Modify: `wechat-carpool-miniprogram/src/pages.json`

- [ ] **Step 1: 在 pages 数组中添加详情页路由**

在 `pages/publish/index` 条目后插入：

```json
{
  "path": "pages/ride/detail",
  "style": {
    "navigationBarTitleText": "拼车详情"
  }
},
```

- [ ] **Step 2: Commit**

```bash
git add wechat-carpool-miniprogram/src/pages.json
git commit -m "chore: 注册拼车详情页路由"
```

---

## Task 6: 首页跳转详情页

**Files:**
- Modify: `wechat-carpool-miniprogram/src/pages/home/index.vue`

- [ ] **Step 1: 找到 viewDetail 方法，修改跳转逻辑**

找到 `viewDetail` 函数，将其内容替换为：

```ts
const viewDetail = (ride: Ride) => {
  uni.navigateTo({
    url: `/pages/ride/detail?id=${ride.id}`
  })
}
```

- [ ] **Step 2: Commit**

```bash
git add wechat-carpool-miniprogram/src/pages/home/index.vue
git commit -m "feat: 首页拼车卡片点击跳转详情页"
```

---

## 验证清单

- [ ] 发布页出发地/目的地点击后弹出地图选点
- [ ] 选点后地址文字正确显示
- [ ] 切换到"车找人"时途径点区块出现，切换回"人找车"时消失
- [ ] 途径点最多3个，超出后添加按钮变灰
- [ ] 途径点可删除
- [ ] 表单提交时坐标字段包含在请求体中
- [ ] 首页卡片点击跳转详情页
- [ ] 详情页地图正确显示出发地、途径点、目的地标记和折线
- [ ] 无坐标数据时地图区域隐藏
- [ ] 联系车主按钮跳转聊天页
