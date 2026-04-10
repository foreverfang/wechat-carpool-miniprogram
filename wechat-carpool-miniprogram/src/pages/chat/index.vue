<template>
  <view class="chat-container">
    <!-- 未登录 -->
    <view v-if="!isLoggedIn" class="center-tip">
      <text class="tip-icon">💬</text>
      <text class="tip-text">请先登录后查看消息</text>
      <button class="login-btn" @click="goLogin">去登录</button>
    </view>

    <!-- 连接中 -->
    <view v-else-if="!imReady" class="center-tip">
      <text class="tip-icon">⏳</text>
      <text class="tip-text">正在连接消息服务...</text>
    </view>

    <!-- 已登录已连接 -->
    <view v-else class="conversation-wrap">
      <!-- 无会话空状态 -->
      <view v-if="conversationList.length === 0" class="center-tip">
        <text class="tip-icon">💬</text>
        <text class="tip-text">暂无消息</text>
        <text class="tip-sub">去首页联系拼车伙伴吧</text>
      </view>
      <TUIConversation
        v-show="conversationList.length > 0"
        @handleSwitchConversation="handleSwitchConversation"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import TUIConversation from '@tencentcloud/chat-uikit-uniapp/components/TUIConversation/index.vue';
import { TUIStore, StoreName } from '@tencentcloud/chat-uikit-engine-lite';
import { timLogin } from '@/utils/tim';

const isLoggedIn = ref(false);
const imReady = ref(false);
const conversationList = ref<any[]>([]);

onShow(async () => {
  const token = uni.getStorageSync('token');
  if (!token) {
    isLoggedIn.value = false;
    imReady.value = false;
    return;
  }
  isLoggedIn.value = true;
  try {
    await timLogin();
    imReady.value = true;
    TUIStore.watch(StoreName.CONV, {
      conversationList: (list: any[]) => {
        conversationList.value = list || [];
      },
    });
  } catch (e) {
    console.error('IM 登录失败', e);
    imReady.value = false;
  }
});

const goLogin = () => {
  uni.navigateTo({ url: '/pages/login/index' });
};

const handleSwitchConversation = (conversationID: string) => {
  uni.navigateTo({
    url: `/pages/chat/detail?conversationID=${conversationID}`,
  });
};
</script>

<style lang="scss">
.chat-container .tui-conversation-header {
  display: none !important;
}
</style>

<style scoped lang="scss">
.chat-container {
  height: 100vh;
  background-color: #f5f5f5;
}

.center-tip {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24rpx;

  .tip-icon {
    font-size: 100rpx;
    line-height: 1;
    opacity: 0.5;
  }

  .tip-text {
    font-size: 32rpx;
    color: #999;
  }

  .tip-sub {
    font-size: 26rpx;
    color: #bbb;
  }

  .login-btn {
    margin-top: 16rpx;
    width: 280rpx;
    height: 80rpx;
    background-color: #1890FF;
    color: #fff;
    border-radius: 40rpx;
    font-size: 28rpx;
    border: none;
    line-height: 80rpx;
  }
}

.conversation-wrap {
  height: 100%;
}
</style>
