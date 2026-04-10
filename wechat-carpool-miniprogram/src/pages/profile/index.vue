<template>
  <view class="profile-container">
    <!-- 未登录状态 -->
    <view v-if="!isLoggedIn" class="login-tip">
      <text class="tip-icon-text">👤</text>
      <text class="tip-text">登录后查看个人信息</text>
      <button class="login-btn" @click="goLogin">去登录</button>
    </view>

    <!-- 已登录状态 -->
    <template v-else>
      <!-- 用户信息卡片 -->
      <view class="user-card">
        <image v-if="userInfo.avatar" :src="userInfo.avatar" class="avatar" />
        <view v-else class="avatar-placeholder">
          <text class="avatar-emoji">👤</text>
        </view>
        <view class="user-info">
          <text class="username">{{ userInfo.username }}</text>
          <view class="rating">
            <text class="star">⭐</text>
            <text class="score">{{ userInfo.rating }}</text>
            <text class="verified" v-if="userInfo.verified">✓ 已认证</text>
          </view>
        </view>
        <text class="edit-icon" @click="editProfile">›</text>
      </view>

      <!-- 统计数据 -->
      <view class="stats-card">
        <view class="stat-item" @click="viewRecords('published')">
          <text class="stat-value">{{ stats.published }}</text>
          <text class="stat-label">发布次数</text>
        </view>
        <view class="stat-item" @click="viewRecords('joined')">
          <text class="stat-value">{{ stats.joined }}</text>
          <text class="stat-label">参与次数</text>
        </view>
        <view class="stat-item" @click="viewRecords('completed')">
          <text class="stat-value">{{ stats.completed }}</text>
          <text class="stat-label">完成次数</text>
        </view>
      </view>

      <!-- 功能菜单 -->
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

        <view class="menu-item" @click="viewRatings">
          <view class="menu-left">
            <text class="menu-icon">⭐</text>
            <text class="menu-text">我的评价</text>
          </view>
          <text class="menu-arrow">›</text>
        </view>
      </view>

      <view class="menu-section">
        <view class="menu-item" @click="handleAuth">
          <view class="menu-left">
            <text class="menu-icon">🔐</text>
            <text class="menu-text">实名认证</text>
          </view>
          <view class="menu-right">
            <text class="status" :class="userInfo.verified ? 'verified' : ''">
              {{ userInfo.verified ? '已认证' : '未认证' }}
            </text>
            <text class="menu-arrow">›</text>
          </view>
        </view>

        <view class="menu-item" @click="handleSettings">
          <view class="menu-left">
            <text class="menu-icon">⚙️</text>
            <text class="menu-text">设置</text>
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
    </template>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getUserInfo, getUserStatistics } from '@/api/user'

interface UserInfo {
  avatar: string
  username: string
  rating: number
  verified: boolean
}

interface Stats {
  published: number
  joined: number
  completed: number
}

const isLoggedIn = ref(false)
const userInfo = ref<UserInfo>({
  avatar: '',
  username: '用户名',
  rating: 5.0,
  verified: false
})

const stats = ref<Stats>({
  published: 0,
  joined: 0,
  completed: 0
})

const loadUserInfo = async () => {
  try {
    const res = await getUserInfo()
    userInfo.value = {
      avatar: (res as any).avatar || '',
      username: (res as any).nickname || '用户名',
      rating: (res as any).rating || 5.0,
      verified: (res as any).isVerified || false,
    }
  } catch (error) {
    console.error('加载用户信息失败', error)
  }
}

const loadStats = async () => {
  try {
    const res = await getUserStatistics()
    stats.value = {
      published: (res as any).published || 0,
      joined: (res as any).findCar || 0,
      completed: (res as any).completed || 0,
    }
  } catch (error) {
    console.error('加载统计失败', error)
  }
}

onShow(() => {
  const token = uni.getStorageSync('token')
  if (!token) {
    isLoggedIn.value = false
    return
  }
  isLoggedIn.value = true
  loadUserInfo()
  loadStats()
})

const goLogin = () => {
  uni.navigateTo({ url: '/pages/login/index' })
}

const editProfile = () => {
  uni.showToast({ title: '编辑资料', icon: 'none' })
}

const viewRecords = (type: string) => {
  uni.navigateTo({
    url: `/pages/profile/records?type=${type}`
  })
}

const navigateTo = (url: string) => {
  uni.navigateTo({ url })
}

const viewRatings = () => {
  uni.showToast({ title: '我的评价', icon: 'none' })
}

const handleAuth = () => {
  uni.showToast({ title: '实名认证', icon: 'none' })
}

const handleSettings = () => {
  uni.showToast({ title: '设置', icon: 'none' })
}

const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        uni.removeStorageSync('token')
        uni.removeStorageSync('userInfo')
        isLoggedIn.value = false
      }
    }
  })
}
</script>

<style scoped lang="scss">
.profile-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 40rpx;
}

.login-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 70vh;
  gap: 32rpx;

  .tip-icon-text {
    font-size: 120rpx;
    line-height: 1;
    opacity: 0.4;
  }

  .tip-text {
    font-size: 30rpx;
    color: #999;
  }

  .login-btn {
    width: 280rpx;
    background-color: #1890FF;
    color: #fff;
    border-radius: 40rpx;
    font-size: 28rpx;
    border: none;
  }
}

.user-card {
  display: flex;
  align-items: center;
  padding: 40rpx 24rpx;
  background: linear-gradient(135deg, #1890FF 0%, #096DD9 100%);
  color: #fff;

  .avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    margin-right: 24rpx;
    border: 4rpx solid rgba(255, 255, 255, 0.3);
  }

  .avatar-placeholder {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    margin-right: 24rpx;
    background-color: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;

    .avatar-emoji {
      font-size: 64rpx;
      line-height: 1;
    }
  }

  .user-info {
    flex: 1;

    .username {
      display: block;
      font-size: 36rpx;
      font-weight: bold;
      margin-bottom: 12rpx;
    }

    .rating {
      display: flex;
      align-items: center;
      font-size: 24rpx;

      .star {
        margin-right: 8rpx;
      }

      .score {
        margin-right: 16rpx;
      }

      .verified {
        padding: 4rpx 12rpx;
        background-color: rgba(255, 255, 255, 0.2);
        border-radius: 20rpx;
        font-size: 20rpx;
      }
    }
  }

  .edit-icon {
    font-size: 48rpx;
    opacity: 0.8;
  }
}

.stats-card {
  display: flex;
  margin: 20rpx;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 32rpx 0;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);

  .stat-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    border-right: 1rpx solid #eee;

    &:last-child {
      border-right: none;
    }

    .stat-value {
      font-size: 40rpx;
      font-weight: bold;
      color: #1890FF;
      margin-bottom: 12rpx;
    }

    .stat-label {
      font-size: 24rpx;
      color: #999;
    }
  }
}

.menu-section {
  margin: 20rpx;
  background-color: #fff;
  border-radius: 16rpx;
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

    .menu-right {
      display: flex;
      align-items: center;

      .status {
        font-size: 24rpx;
        color: #999;
        margin-right: 12rpx;

        &.verified {
          color: #1890FF;
        }
      }
    }

    .menu-arrow {
      font-size: 40rpx;
      color: #ccc;
    }
  }
}
</style>
