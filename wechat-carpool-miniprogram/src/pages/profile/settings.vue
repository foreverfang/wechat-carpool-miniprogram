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
    // any 类型用于兼容后端返回的动态字段
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
