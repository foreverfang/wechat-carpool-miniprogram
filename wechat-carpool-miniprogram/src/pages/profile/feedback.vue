<template>
  <view class="feedback-container">
    <!-- 反馈类型 -->
    <view class="form-card">
      <view class="form-label">反馈类型</view>
      <view class="type-group">
        <view
          v-for="t in types"
          :key="t.value"
          :class="['type-item', form.type === t.value ? 'active' : '']"
          @click="form.type = t.value"
        >
          <text class="type-icon">{{ t.icon }}</text>
          <text class="type-text">{{ t.label }}</text>
        </view>
      </view>
    </view>

    <!-- 反馈内容 -->
    <view class="form-card">
      <view class="form-label">反馈内容 <text class="required">*</text></view>
      <textarea
        class="textarea"
        v-model="form.content"
        placeholder="请详细描述您的问题或建议（最多 200 字）"
        :maxlength="200"
        auto-height
      />
      <text class="word-count">{{ form.content.length }}/200</text>
    </view>

    <!-- 联系方式（可选） -->
    <view class="form-card">
      <view class="form-label">联系方式 <text class="optional">（选填）</text></view>
      <input
        class="input"
        v-model="form.contactInfo"
        placeholder="手机号或微信，方便我们回复您"
        :maxlength="50"
      />
    </view>

    <!-- 提交按钮 -->
    <view class="submit-area">
      <button class="submit-btn" :loading="submitting" @click="submit">
        提交反馈
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { submitFeedback } from '@/api/feedback'

const types = [
  { value: 'suggestion', label: '功能建议', icon: '💡' },
  { value: 'bug', label: '问题反馈', icon: '🐛' },
  { value: 'other', label: '其他', icon: '💬' },
]

const form = ref({
  type: 'suggestion' as 'suggestion' | 'bug' | 'other',
  content: '',
  contactInfo: '',
})

const submitting = ref(false)

const submit = async () => {
  if (!form.value.content.trim()) {
    uni.showToast({ title: '请填写反馈内容', icon: 'none' })
    return
  }

  submitting.value = true
  try {
    await submitFeedback({
      type: form.value.type,
      content: form.value.content.trim(),
      contactInfo: form.value.contactInfo.trim() || undefined,
    })
    uni.showToast({ title: '提交成功，感谢您的反馈！', icon: 'success' })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch {
    uni.showToast({ title: '提交失败，请重试', icon: 'none' })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
.feedback-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx;
}

.form-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);

  .form-label {
    font-size: 28rpx;
    color: #333;
    font-weight: bold;
    margin-bottom: 24rpx;

    .required {
      color: #ff4d4f;
      margin-left: 4rpx;
    }

    .optional {
      font-size: 24rpx;
      color: #999;
      font-weight: normal;
    }
  }
}

.type-group {
  display: flex;
  gap: 20rpx;

  .type-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24rpx 0;
    background-color: #f5f5f5;
    border-radius: 12rpx;
    border: 2rpx solid transparent;

    &.active {
      background-color: #e6f4ff;
      border-color: #1890FF;
    }

    .type-icon {
      font-size: 48rpx;
      margin-bottom: 8rpx;
    }

    .type-text {
      font-size: 24rpx;
      color: #666;
    }
  }
}

.textarea {
  width: 100%;
  min-height: 240rpx;
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
  box-sizing: border-box;
}

.word-count {
  display: block;
  text-align: right;
  font-size: 22rpx;
  color: #bbb;
  margin-top: 12rpx;
}

.input {
  width: 100%;
  height: 80rpx;
  font-size: 28rpx;
  color: #333;
  border-bottom: 1rpx solid #eee;
  box-sizing: border-box;
}

.submit-area {
  padding: 20rpx 0 40rpx;

  .submit-btn {
    width: 100%;
    height: 96rpx;
    background-color: #1890FF;
    color: #fff;
    border-radius: 48rpx;
    font-size: 32rpx;
    border: none;
    line-height: 96rpx;
  }
}
</style>
