<template>
  <view class="home-container">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-input">
        <text class="icon">🔍</text>
        <input
          v-model="searchKeyword"
          placeholder="搜索出发地或目的地"
          @confirm="onSearch"
        />
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
          <button v-if="!ride.isMine" class="contact-btn" @click.stop="contactUser(ride)">
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
import { onPullDownRefresh, onShow } from '@dcloudio/uni-app'
import type { Ride } from '@/types'
import { createConversation } from '@/api/chat'
import { getRideList, searchRides } from '@/api/ride'
import { timLogin } from '@/utils/tim'

// 首页展示用，在 Ride 基础上扩展 isMine 字段
type HomeRide = Ride & { isMine: boolean }

const activeTab = ref<'find-car' | 'find-passenger'>('find-car')
const rideList = ref<HomeRide[]>([])
const loading = ref(false)
const hasMore = ref(true)
const page = ref(1)
const searchKeyword = ref('')

const formatRide = (item: any): HomeRide => {
  const userInfo = JSON.parse(uni.getStorageSync('userInfo') || '{}')
  const myId = String(userInfo.id || '')
  const rideUserId = String(item.user?.id || '')
  return {
    id: String(item.id),
    type: item.type,
    avatar: item.user?.avatar || '',
    username: item.user?.nickname || '用户',
    rating: item.user?.rating || 5,
    departure: item.departure,
    destination: item.destination,
    departureTime: new Date(item.departureTime).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    seats: item.seats || 1,
    note: item.note,
    publishTime: formatTimeAgo(item.createdAt),
    userId: rideUserId,
    isMine: myId !== '' && myId === rideUserId,
  }
}

const formatTimeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes}分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}小时前`
  return `${Math.floor(hours / 24)}天前`
}

// 记录上次加载时间,用于 onShow 判断是否需要刷新
let lastLoadTime = 0

const switchTab = (tab: 'find-car' | 'find-passenger') => {
  activeTab.value = tab
  page.value = 1
  rideList.value = []
  hasMore.value = true
  loadRideList()
}

const loadRideList = async () => {
  if (loading.value || !hasMore.value) return
  loading.value = true

  try {
    const res = await getRideList({ type: activeTab.value, page: page.value, limit: 10 })
    const newItems = (res.list || []).map(formatRide)
    rideList.value.push(...newItems)
    hasMore.value = newItems.length >= 10
    lastLoadTime = Date.now()  // 更新时间戳
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

const onSearch = async () => {
  if (!searchKeyword.value.trim()) {
    page.value = 1
    rideList.value = []
    hasMore.value = true
    loadRideList()
    return
  }
  try {
    loading.value = true
    const res = await searchRides({ keyword: searchKeyword.value, type: activeTab.value })
    rideList.value = (res.list || []).map(formatRide)
    hasMore.value = false
  } catch (error) {
    uni.showToast({ title: '搜索失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const viewDetail = (ride: HomeRide) => {
  uni.navigateTo({
    url: `/pages/ride/detail?id=${ride.id}`
  })
}

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
      url: `/pages/chat/detail?conversationID=${res.conversationId}`,
    })
  } catch (err) {
    uni.hideLoading()
    uni.showToast({ title: '无法发起聊天', icon: 'none' })
  }
}

onMounted(() => {
  lastLoadTime = Date.now()  // 初始化为当前时间
  loadRideList()
})

// 下拉刷新
onPullDownRefresh(() => {
  page.value = 1
  rideList.value = []
  hasMore.value = true
  loadRideList().finally(() => {
    uni.stopPullDownRefresh()
  })
})

// 页面显示时检查是否需要刷新
onShow(() => {
  // 搜索状态下不自动刷新
  if (searchKeyword.value.trim()) return

  const now = Date.now()
  // 如果距离上次加载超过5秒,则刷新列表
  if (now - lastLoadTime > 5000) {
    page.value = 1
    rideList.value = []
    hasMore.value = true
    loadRideList()
  }
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

    .avatar-placeholder {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
      margin-right: 20rpx;
      background-color: #f0f0f0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40rpx;
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
        background-color: #1890FF;
      }

      &.find-passenger {
        background-color: #52C41A;
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
      background-color: #1890FF;
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
