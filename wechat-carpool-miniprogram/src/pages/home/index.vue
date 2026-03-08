<template>
  <view class="home-container">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-input">
        <text class="icon">🔍</text>
        <input placeholder="搜索出发地或目的地" />
      </view>
    </view>

    <!-- 切换标签 -->
    <view class="tabs">
      <view
        :class="['tab-item', activeTab === 'find-car' ? 'active' : '']"
        @click="switchTab('find-car')"
      >
        人找车
      </view>
      <view
        :class="['tab-item', activeTab === 'find-passenger' ? 'active' : '']"
        @click="switchTab('find-passenger')"
      >
        车找人
      </view>
    </view>

    <!-- 拼车列表 -->
    <scroll-view
      class="ride-list"
      scroll-y
      @scrolltolower="loadMore"
    >
      <view
        v-for="ride in rideList"
        :key="ride.id"
        class="ride-card"
        @click="viewDetail(ride)"
      >
        <view class="ride-header">
          <image :src="ride.avatar" class="avatar" />
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

        <view class="ride-content">
          <view class="location-info">
            <view class="location-item">
              <text class="icon">📍</text>
              <text class="text">{{ ride.departure }}</text>
            </view>
            <view class="arrow">→</view>
            <view class="location-item">
              <text class="icon">🎯</text>
              <text class="text">{{ ride.destination }}</text>
            </view>
          </view>

          <view class="ride-details">
            <text class="detail-item">🕐 {{ ride.departureTime }}</text>
            <text class="detail-item">💺 {{ ride.seats }}人</text>
            <text class="detail-item" v-if="ride.distance">
              📏 {{ ride.distance }}km
            </text>
          </view>

          <view class="ride-note" v-if="ride.note">
            {{ ride.note }}
          </view>
        </view>

        <view class="ride-footer">
          <text class="time">{{ ride.publishTime }}</text>
          <button class="contact-btn" @click.stop="contactUser(ride)">
            联系TA
          </button>
        </view>
      </view>

      <view v-if="loading" class="loading">加载中...</view>
      <view v-if="!hasMore" class="no-more">没有更多了</view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Ride {
  id: string
  type: 'find-car' | 'find-passenger'
  avatar: string
  username: string
  rating: number
  departure: string
  destination: string
  departureTime: string
  seats: number
  distance?: number
  note?: string
  publishTime: string
}

const activeTab = ref<'find-car' | 'find-passenger'>('find-car')
const rideList = ref<Ride[]>([])
const loading = ref(false)
const hasMore = ref(true)
const page = ref(1)

const switchTab = (tab: 'find-car' | 'find-passenger') => {
  activeTab.value = tab
  page.value = 1
  rideList.value = []
  loadRideList()
}

const loadRideList = async () => {
  if (loading.value) return
  loading.value = true

  try {
    // TODO: 调用实际 API
    // const res = await getRideList({ type: activeTab.value, page: page.value })

    // 模拟数据
    const mockData: Ride[] = [
      {
        id: '1',
        type: activeTab.value,
        avatar: '/static/logo.png',
        username: '张三',
        rating: 4.8,
        departure: '北京朝阳区',
        destination: '北京海淀区',
        departureTime: '今天 18:00',
        seats: 2,
        distance: 15,
        note: '下班顺路，可以稍等一会',
        publishTime: '10分钟前'
      }
    ]

    rideList.value.push(...mockData)
    hasMore.value = mockData.length > 0
  } catch (error) {
    console.error('加载失败', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const loadMore = () => {
  if (!hasMore.value || loading.value) return
  page.value++
  loadRideList()
}

const viewDetail = (ride: Ride) => {
  // TODO: 跳转到详情页
  console.log('查看详情', ride)
}

const contactUser = (ride: Ride) => {
  // TODO: 跳转到聊天页
  uni.navigateTo({
    url: `/pages/chat/detail?userId=${ride.id}`
  })
}

onMounted(() => {
  loadRideList()
})
</script>

<style scoped lang="scss">
.home-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.search-bar {
  padding: 20rpx;
  background-color: #fff;

  .search-input {
    display: flex;
    align-items: center;
    padding: 16rpx 24rpx;
    background-color: #f5f5f5;
    border-radius: 40rpx;

    .icon {
      margin-right: 12rpx;
      font-size: 32rpx;
    }

    input {
      flex: 1;
      font-size: 28rpx;
    }
  }
}

.tabs {
  display: flex;
  background-color: #fff;
  border-bottom: 1rpx solid #eee;

  .tab-item {
    flex: 1;
    padding: 24rpx 0;
    text-align: center;
    font-size: 30rpx;
    color: #666;
    position: relative;

    &.active {
      color: #07c160;
      font-weight: bold;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 60rpx;
        height: 6rpx;
        background-color: #07c160;
        border-radius: 3rpx;
      }
    }
  }
}

.ride-list {
  height: calc(100vh - 200rpx);
  padding: 20rpx;
}

.ride-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);

  .ride-header {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;

    .avatar {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
      margin-right: 20rpx;
    }

    .user-info {
      flex: 1;

      .username {
        display: block;
        font-size: 32rpx;
        font-weight: bold;
        margin-bottom: 8rpx;
      }

      .rating {
        display: flex;
        align-items: center;
        font-size: 24rpx;
        color: #666;

        .star {
          margin-right: 8rpx;
        }
      }
    }

    .type-badge {
      padding: 8rpx 20rpx;
      border-radius: 20rpx;
      font-size: 24rpx;
      color: #fff;

      &.find-car {
        background-color: #07c160;
      }

      &.find-passenger {
        background-color: #1989fa;
      }
    }
  }

  .ride-content {
    .location-info {
      display: flex;
      align-items: center;
      margin-bottom: 20rpx;

      .location-item {
        flex: 1;
        display: flex;
        align-items: center;

        .icon {
          margin-right: 12rpx;
          font-size: 32rpx;
        }

        .text {
          font-size: 28rpx;
          color: #333;
        }
      }

      .arrow {
        margin: 0 20rpx;
        font-size: 32rpx;
        color: #999;
      }
    }

    .ride-details {
      display: flex;
      gap: 24rpx;
      margin-bottom: 16rpx;

      .detail-item {
        font-size: 24rpx;
        color: #666;
      }
    }

    .ride-note {
      padding: 16rpx;
      background-color: #f5f5f5;
      border-radius: 8rpx;
      font-size: 26rpx;
      color: #666;
      line-height: 1.6;
    }
  }

  .ride-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20rpx;
    padding-top: 20rpx;
    border-top: 1rpx solid #eee;

    .time {
      font-size: 24rpx;
      color: #999;
    }

    .contact-btn {
      padding: 12rpx 32rpx;
      background-color: #07c160;
      color: #fff;
      border-radius: 40rpx;
      font-size: 26rpx;
      border: none;
    }
  }
}

.loading,
.no-more {
  text-align: center;
  padding: 40rpx 0;
  font-size: 28rpx;
  color: #999;
}
</style>
