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

// 当前用户 ID（onLoad 时读取，避免启动时序问题）
const currentUserId = ref('')
const isOwner = computed(() => !!ride.value && ride.value.userId === currentUserId.value)

onLoad(async (options) => {
  const id = options?.id
  if (!id) return
  loading.value = true
  currentUserId.value = uni.getStorageSync('userId') || ''
  try {
    ride.value = await getRideDetail(id)
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
    ride.value.departureLocation,
    ...(ride.value.waypoints ?? []),
    ride.value.destinationLocation
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
  const dep = ride.value.departureLocation
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
  const dest = ride.value.destinationLocation
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
  padding: 20rpx 48rpx calc(20rpx + env(safe-area-inset-bottom));
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
