<template>
  <view class="chat-container">
    <scroll-view class="chat-list" scroll-y>
      <view
        v-for="chat in chatList"
        :key="chat.id"
        class="chat-item"
        @click="openChat(chat)"
      >
        <image :src="chat.avatar" class="avatar" />
        <view class="chat-content">
          <view class="chat-header">
            <text class="username">{{ chat.username }}</text>
            <text class="time">{{ chat.lastMessageTime }}</text>
          </view>
          <view class="chat-footer">
            <text class="last-message">{{ chat.lastMessage }}</text>
            <view v-if="chat.unreadCount > 0" class="unread-badge">
              {{ chat.unreadCount > 99 ? '99+' : chat.unreadCount }}
            </view>
          </view>
        </view>
      </view>

      <view v-if="chatList.length === 0" class="empty">
        <text class="empty-icon">💬</text>
        <text class="empty-text">暂无消息</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Chat {
  id: string
  avatar: string
  username: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
}

const chatList = ref<Chat[]>([])

const loadChatList = async () => {
  try {
    // TODO: 调用实际 API
    // const res = await getChatList()

    // 模拟数据
    chatList.value = [
      {
        id: '1',
        avatar: '/static/logo.png',
        username: '张三',
        lastMessage: '好的，那我们18:00在地铁站见',
        lastMessageTime: '10:30',
        unreadCount: 2
      },
      {
        id: '2',
        avatar: '/static/logo.png',
        username: '李四',
        lastMessage: '请问还有座位吗？',
        lastMessageTime: '昨天',
        unreadCount: 0
      }
    ]
  } catch (error) {
    console.error('加载失败', error)
  }
}

const openChat = (chat: Chat) => {
  uni.navigateTo({
    url: `/pages/chat/detail?userId=${chat.id}`
  })
}

onMounted(() => {
  loadChatList()
})
</script>

<style scoped lang="scss">
.chat-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.chat-list {
  height: 100vh;
}

.chat-item {
  display: flex;
  padding: 24rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #eee;

  .avatar {
    width: 96rpx;
    height: 96rpx;
    border-radius: 50%;
    margin-right: 20rpx;
  }

  .chat-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .chat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12rpx;

      .username {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
      }

      .time {
        font-size: 24rpx;
        color: #999;
      }
    }

    .chat-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .last-message {
        flex: 1;
        font-size: 28rpx;
        color: #666;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .unread-badge {
        min-width: 36rpx;
        height: 36rpx;
        padding: 0 8rpx;
        background-color: #ff4d4f;
        color: #fff;
        border-radius: 18rpx;
        font-size: 20rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-left: 16rpx;
      }
    }
  }
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 0;

  .empty-icon {
    font-size: 120rpx;
    margin-bottom: 24rpx;
  }

  .empty-text {
    font-size: 28rpx;
    color: #999;
  }
}
</style>
