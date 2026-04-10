<template>
  <view class="login-page">
    <view class="logo-area">
      <text class="logo-icon">🚗</text>
      <text class="app-name">拼车小程序</text>
      <text class="slogan">安全便捷，一起出行</text>
    </view>

    <!-- 步骤1: 微信登录 -->
    <view v-if="step === 1" class="login-area">
      <button
        class="wx-login-btn"
        :loading="loading"
        :disabled="loading"
        @click="handleLogin"
      >
        <text class="btn-text">微信一键登录</text>
      </button>
      <text class="privacy-tip">登录即代表同意《用户协议》和《隐私政策》</text>
    </view>

    <!-- 步骤2: 完善头像和昵称 -->
    <view v-if="step === 2" class="profile-area">
      <text class="profile-title">完善个人信息</text>

      <!-- 选择头像 -->
      <button class="avatar-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
        <image v-if="tempAvatar" :src="tempAvatar" class="avatar-preview" />
        <view v-else class="avatar-placeholder">
          <text class="avatar-icon">👤</text>
          <text class="avatar-tip">点击选择头像</text>
        </view>
      </button>

      <!-- 输入昵称 -->
      <view class="nickname-wrap">
        <input
          class="nickname-input"
          type="nickname"
          v-model="tempNickname"
          placeholder="点击设置昵称"
          maxlength="20"
        />
      </view>

      <button
        class="confirm-btn"
        :loading="saving"
        :disabled="saving"
        @click="handleSaveProfile"
      >
        完成
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { wxLogin, updateUserInfo } from '@/api/user'

const loading = ref(false)
const saving = ref(false)
const step = ref(1)
const tempAvatar = ref('')
const tempNickname = ref('')

const handleLogin = async () => {
  if (loading.value) return
  loading.value = true

  try {
    let code = ''

    // 调用微信登录获取 code
    const loginRes = await new Promise<{ code: string }>((resolve, reject) => {
      uni.login({
        provider: 'weixin',
        success: (res) => resolve({ code: res.code }),
        fail: (err) => reject(err),
      })
    })
    code = loginRes.code

    // 开发环境:如果 code 看起来像模拟 code,改用测试登录
    // 微信开发者工具返回的 code 通常是 "the code is a mock one"
    if (code.includes('mock') || code.length < 20) {
      console.log('检测到模拟 code,使用测试登录')
      code = 'dev_test_user_' + Date.now()
    }

    const res = await wxLogin(code)

    uni.setStorageSync('token', res.token)
    uni.setStorageSync('userInfo', JSON.stringify(res.user))

    // 已有头像昵称则直接跳转，否则引导完善
    const user = res.user as any
    if (user.avatar && user.nickname && user.nickname !== '微信用户') {
      uni.showToast({ title: '登录成功', icon: 'success' })
      redirectAfterLogin()
    } else {
      step.value = 2
    }
  } catch (err) {
    console.error('登录失败', err)
    uni.showToast({ title: '登录失败，请重试', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const onChooseAvatar = (e: any) => {
  tempAvatar.value = e.detail.avatarUrl
}

const handleSaveProfile = async () => {
  if (saving.value) return
  saving.value = true
  try {
    if (tempAvatar.value || tempNickname.value) {
      await updateUserInfo({
        avatar: tempAvatar.value || undefined,
        nickname: tempNickname.value || undefined,
      } as any)
      // 更新本地缓存
      const userInfo = JSON.parse(uni.getStorageSync('userInfo') || '{}')
      if (tempAvatar.value) userInfo.avatar = tempAvatar.value
      if (tempNickname.value) userInfo.nickname = tempNickname.value
      uni.setStorageSync('userInfo', JSON.stringify(userInfo))
    }
    uni.showToast({ title: '登录成功', icon: 'success' })
    redirectAfterLogin()
  } catch (err) {
    // 保存失败也放行，不阻止登录
    redirectAfterLogin()
  } finally {
    saving.value = false
  }
}

const redirectAfterLogin = () => {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
  } else {
    uni.switchTab({ url: '/pages/home/index' })
  }
}
</script>

<style scoped lang="scss">
.login-page {
  height: 100vh;
  background: linear-gradient(160deg, #e8f4ff 0%, #ffffff 60%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 60rpx;
  gap: 120rpx;
}

.logo-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;

  .logo-icon {
    font-size: 100rpx;
    line-height: 1;
  }

  .app-name {
    font-size: 44rpx;
    font-weight: bold;
    color: #1890FF;
  }

  .slogan {
    font-size: 26rpx;
    color: #999;
  }
}

.login-area {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32rpx;

  .wx-login-btn {
    width: 100%;
    height: 96rpx;
    background-color: #1890FF;
    color: #fff;
    border-radius: 48rpx;
    font-size: 32rpx;
    font-weight: bold;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;

    &[disabled] {
      opacity: 0.6;
    }
  }

  .privacy-tip {
    font-size: 22rpx;
    color: #bbb;
    text-align: center;
  }
}

.profile-area {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40rpx;

  .profile-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
  }

  .avatar-btn {
    width: 160rpx;
    height: 160rpx;
    border-radius: 50%;
    padding: 0;
    background: none;
    border: none;
    overflow: hidden;

    &::after {
      border: none;
    }

    .avatar-preview {
      width: 160rpx;
      height: 160rpx;
      border-radius: 50%;
    }

    .avatar-placeholder {
      width: 160rpx;
      height: 160rpx;
      border-radius: 50%;
      background-color: #f0f0f0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8rpx;

      .avatar-icon {
        font-size: 64rpx;
        line-height: 1;
      }

      .avatar-tip {
        font-size: 20rpx;
        color: #999;
      }
    }
  }

  .nickname-wrap {
    width: 100%;
    background-color: #f8f8f8;
    border-radius: 12rpx;
    padding: 0 24rpx;

    .nickname-input {
      width: 100%;
      height: 88rpx;
      font-size: 30rpx;
      color: #333;
      text-align: center;
    }
  }

  .confirm-btn {
    width: 100%;
    height: 96rpx;
    background-color: #1890FF;
    color: #fff;
    border-radius: 48rpx;
    font-size: 32rpx;
    font-weight: bold;
    border: none;

    &[disabled] {
      opacity: 0.6;
    }
  }
}
</style>
