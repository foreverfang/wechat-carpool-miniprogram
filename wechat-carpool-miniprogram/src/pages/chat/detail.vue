<template>
  <view class="chat-detail-container">
    <scroll-view
      class="message-list"
      scroll-y
      :scroll-into-view="scrollIntoView"
      scroll-with-animation
    >
      <view
        v-for="msg in messageList"
        :key="msg.id"
        :id="`msg-${msg.id}`"
        :class="['message-item', msg.isSelf ? 'self' : 'other']"
      >
        <image v-if="!msg.isSelf" :src="msg.avatar" class="avatar" />
        <view class="message-content">
          <text class="message-text">{{ msg.content }}</text>
          <text class="message-time">{{ msg.time }}</text>
        </view>
        <image v-if="msg.isSelf" :src="msg.avatar" class="avatar" />
      </view>
    </scroll-view>

    <view class="input-bar">
      <input
        v-model="inputText"
        class="input"
        placeholder="输入消息..."
        confirm-type="send"
        @confirm="sendMessage"
      />
      <button class="send-btn" @click="sendMessage">发送</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Message {
  id: string
  content: string
  time: string
  isSelf: boolean
  avatar: string
}

const messageList = ref<Message[]>([])
const inputText = ref('')
const scrollIntoView = ref('')

const loadMessages = async () => {
  // TODO: 调用实际 API
  // const res = await getMessages(userId)

  // 模拟数据
  messageList.value = [
    {
      id: '1',
      content: '你好，请问还有座位吗？',
      time: '10:20',
      isSelf: false,
      avatar: '/static/logo.png'
    },
    {
      id: '2',
      content: '有的，还有2个座位',
      time: '10:21',
      isSelf: true,
      avatar: '/static/logo.png'
    },
    {
      id: '3',
      content: '好的，那我们18:00在地铁站见',
      time: '10:22',
      isSelf: false,
      avatar: '/static/logo.png'
    }
  ]

  // 滚动到最后一条消息
  setTimeout(() => {
    scrollToBottom()
  }, 100)
}

const sendMessage = async () => {
  if (!inputText.value.trim()) return

  const newMessage: Message = {
    id: Date.now().toString(),
    content: inputText.value,
    time: new Date().toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    isSelf: true,
    avatar: '/static/logo.png'
  }

  messageList.value.push(newMessage)
  inputText.value = ''

  // TODO: 调用发送消息 API
  // await sendMessageApi(newMessage)

  scrollToBottom()
}

const scrollToBottom = () => {
  if (messageList.value.length > 0) {
    const lastMsg = messageList.value[messageList.value.length - 1]
    scrollIntoView.value = `msg-${lastMsg.id}`
  }
}

onMounted(() => {
  loadMessages()
})
</script>

<style scoped lang="scss">
.chat-detail-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.message-list {
  flex: 1;
  padding: 20rpx;
}

.message-item {
  display: flex;
  margin-bottom: 32rpx;

  .avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
  }

  .message-content {
    max-width: 500rpx;
    display: flex;
    flex-direction: column;

    .message-text {
      padding: 20rpx 24rpx;
      border-radius: 12rpx;
      font-size: 28rpx;
      line-height: 1.6;
      word-wrap: break-word;
    }

    .message-time {
      font-size: 20rpx;
      color: #999;
      margin-top: 8rpx;
    }
  }

  &.other {
    .avatar {
      margin-right: 20rpx;
    }

    .message-content {
      align-items: flex-start;

      .message-text {
        background-color: #fff;
        color: #333;
      }
    }
  }

  &.self {
    flex-direction: row-reverse;

    .avatar {
      margin-left: 20rpx;
    }

    .message-content {
      align-items: flex-end;

      .message-text {
        background-color: #07c160;
        color: #fff;
      }
    }
  }
}

.input-bar {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background-color: #fff;
  border-top: 1rpx solid #eee;

  .input {
    flex: 1;
    padding: 16rpx 24rpx;
    background-color: #f5f5f5;
    border-radius: 40rpx;
    font-size: 28rpx;
  }

  .send-btn {
    margin-left: 20rpx;
    padding: 16rpx 32rpx;
    background-color: #07c160;
    color: #fff;
    border-radius: 40rpx;
    font-size: 28rpx;
    border: none;
  }
}
</style>
