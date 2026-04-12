<template>
  <view class="statistics-container">
    <!-- 总览卡片 -->
    <view class="overview-card">
      <text class="title">总览</text>
      <view class="stats-grid">
        <view class="stat-item">
          <text class="value">{{ overview.totalRides }}</text>
          <text class="label">总行程</text>
        </view>
        <view class="stat-item">
          <text class="value">{{ overview.totalDistance }}km</text>
          <text class="label">总里程</text>
        </view>
        <view class="stat-item">
          <text class="value">{{ overview.totalPeople }}</text>
          <text class="label">服务人数</text>
        </view>
        <view class="stat-item">
          <text class="value">{{ overview.carbonReduction }}kg</text>
          <text class="label">减碳量</text>
        </view>
      </view>
    </view>

    <!-- 月度统计 -->
    <view class="chart-card">
      <text class="title">月度统计</text>
      <view class="chart-placeholder">
        <text class="placeholder-text">📊 图表区域</text>
        <text class="placeholder-hint">
          可集成 uCharts 或 ECharts 显示月度趋势
        </text>
      </view>
    </view>

    <!-- 类型分布 -->
    <view class="distribution-card">
      <text class="title">类型分布</text>
      <view class="distribution-list">
        <view class="distribution-item">
          <view class="item-left">
            <view class="color-dot" style="background-color: #1890FF"></view>
            <text class="label">人找车</text>
          </view>
          <view class="item-right">
            <text class="value">{{ distribution.findCar }}</text>
            <text class="percent">
              {{ distribution.total > 0 ? ((distribution.findCar / distribution.total) * 100).toFixed(0) : 0 }}%
            </text>
          </view>
        </view>

        <view class="distribution-item">
          <view class="item-left">
            <view class="color-dot" style="background-color: #1989fa"></view>
            <text class="label">车找人</text>
          </view>
          <view class="item-right">
            <text class="value">{{ distribution.findPassenger }}</text>
            <text class="percent">
              {{ distribution.total > 0 ? ((distribution.findPassenger / distribution.total) * 100).toFixed(0) : 0 }}%
            </text>
          </view>
        </view>
      </view>
    </view>

    <!-- 热门路线 -->
    <view class="routes-card">
      <text class="title">热门路线 TOP 5</text>
      <view class="routes-list">
        <view
          v-for="(route, index) in topRoutes"
          :key="index"
          class="route-item"
        >
          <view class="rank">{{ index + 1 }}</view>
          <view class="route-info">
            <text class="route-text">
              {{ route.departure }} → {{ route.destination }}
            </text>
            <text class="count">{{ route.count }}次</text>
          </view>
        </view>
      </view>
      <view v-if="topRoutes.length === 0" class="empty-hint">
        <text class="empty-text">暂无路线数据</text>
      </view>
    </view>

    <!-- 成就徽章 -->
    <view class="badges-card">
      <text class="title">成就徽章</text>
      <view class="badges-grid">
        <view
          v-for="badge in badges"
          :key="badge.id"
          :class="['badge-item', badge.unlocked ? 'unlocked' : 'locked']"
        >
          <text class="badge-icon">{{ badge.icon }}</text>
          <text class="badge-name">{{ badge.name }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

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
    const data = res as any // API 返回类型暂未定义
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

<style scoped lang="scss">
.statistics-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx;
}

.title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 24rpx;
}

.overview-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 32rpx;

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24rpx;
      background-color: #f5f5f5;
      border-radius: 12rpx;

      .value {
        font-size: 40rpx;
        font-weight: bold;
        color: #1890FF;
        margin-bottom: 12rpx;
      }

      .label {
        font-size: 24rpx;
        color: #666;
      }
    }
  }
}

.chart-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);

  .chart-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 400rpx;
    background-color: #f5f5f5;
    border-radius: 12rpx;

    .placeholder-text {
      font-size: 48rpx;
      margin-bottom: 16rpx;
    }

    .placeholder-hint {
      font-size: 24rpx;
      color: #999;
    }
  }
}

.distribution-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);

  .distribution-list {
    .distribution-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24rpx 0;
      border-bottom: 1rpx solid #eee;

      &:last-child {
        border-bottom: none;
      }

      .item-left {
        display: flex;
        align-items: center;

        .color-dot {
          width: 24rpx;
          height: 24rpx;
          border-radius: 50%;
          margin-right: 16rpx;
        }

        .label {
          font-size: 28rpx;
          color: #333;
        }
      }

      .item-right {
        display: flex;
        align-items: center;
        gap: 16rpx;

        .value {
          font-size: 32rpx;
          font-weight: bold;
          color: #333;
        }

        .percent {
          font-size: 24rpx;
          color: #999;
        }
      }
    }
  }
}

.routes-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);

  .routes-list {
    .route-item {
      display: flex;
      align-items: center;
      padding: 20rpx 0;
      border-bottom: 1rpx solid #eee;

      &:last-child {
        border-bottom: none;
      }

      .rank {
        width: 48rpx;
        height: 48rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #1890FF;
        color: #fff;
        border-radius: 50%;
        font-size: 24rpx;
        font-weight: bold;
        margin-right: 20rpx;
      }

      .route-info {
        flex: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .route-text {
          font-size: 28rpx;
          color: #333;
        }

        .count {
          font-size: 24rpx;
          color: #999;
        }
      }
    }

    .empty-hint {
      padding: 40rpx 0;
      text-align: center;
      .empty-text {
        font-size: 26rpx;
        color: #999;
      }
    }
  }
}

.badges-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);

  .badges-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24rpx;

    .badge-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24rpx;
      background-color: #f5f5f5;
      border-radius: 12rpx;

      .badge-icon {
        font-size: 60rpx;
        margin-bottom: 12rpx;
      }

      .badge-name {
        font-size: 24rpx;
        color: #666;
        text-align: center;
      }

      &.locked {
        opacity: 0.4;
      }
    }
  }
}
</style>
