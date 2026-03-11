<template>
  <view class="publish-page">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">发布拼车信息</text>
      <text class="page-desc">填写以下信息发布您的拼车需求</text>
    </view>

    <!-- 表单容器 -->
    <form class="publish-form">
      <!-- 拼车类型选择器 -->
      <view class="form-section">
        <view class="section-title">
          <text class="required">*</text>
          <text>拼车类型</text>
        </view>
        <radio-group class="radio-group" @change="onTypeChange">
          <label class="radio-item">
            <radio value="find-car" :checked="formData.type === 'find-car'" color="#07C160" />
            <text>找车（我是乘客）</text>
          </label>
          <label class="radio-item">
            <radio value="find-passenger" :checked="formData.type === 'find-passenger'" color="#07C160" />
            <text>找乘客（我是司机）</text>
          </label>
        </radio-group>
      </view>

      <!-- 出发地 -->
      <view class="form-section">
        <view class="section-title">
          <text class="required">*</text>
          <text>出发地</text>
        </view>
        <input
          class="form-input"
          v-model="formData.departure"
          placeholder="请输入出发地，如：北京市朝阳区"
          maxlength="50"
          @blur="validateField('departure')"
        />
        <text v-if="errors.departure" class="error-text">{{ errors.departure }}</text>
      </view>

      <!-- 目的地 -->
      <view class="form-section">
        <view class="section-title">
          <text class="required">*</text>
          <text>目的地</text>
        </view>
        <input
          class="form-input"
          v-model="formData.destination"
          placeholder="请输入目的地，如：北京市海淀区"
          maxlength="50"
          @blur="validateField('destination')"
        />
        <text v-if="errors.destination" class="error-text">{{ errors.destination }}</text>
      </view>

      <!-- 出发时间 -->
      <view class="form-section">
        <view class="section-title">
          <text class="required">*</text>
          <text>出发时间</text>
        </view>
        <picker
          mode="datetime"
          :value="formData.departureTime"
          :start="minDateTime"
          @change="onTimeChange"
        >
          <view class="picker-input">
            <text :class="formData.departureTime ? 'picker-value' : 'picker-placeholder'">
              {{ formData.departureTime || '请选择出发时间' }}
            </text>
          </view>
        </picker>
        <text v-if="errors.departureTime" class="error-text">{{ errors.departureTime }}</text>
      </view>

      <!-- 座位数（找乘客模式显示） -->
      <view v-if="formData.type === 'find-passenger'" class="form-section">
        <view class="section-title">
          <text class="required">*</text>
          <text>座位数</text>
        </view>
        <input
          class="form-input"
          type="number"
          v-model.number="formData.seats"
          placeholder="请输入座位数（1-8）"
          @blur="validateField('seats')"
        />
        <text v-if="errors.seats" class="error-text">{{ errors.seats }}</text>
      </view>

      <!-- 价格 -->
      <view class="form-section">
        <view class="section-title">
          <text>价格（可选）</text>
        </view>
        <input
          class="form-input"
          type="digit"
          v-model.number="formData.price"
          placeholder="请输入价格（元），免费可不填"
          @blur="validateField('price')"
        />
        <text v-if="errors.price" class="error-text">{{ errors.price }}</text>
      </view>

      <!-- 备注 -->
      <view class="form-section">
        <view class="section-title">
          <text>备注（可选）</text>
        </view>
        <textarea
          class="form-textarea"
          v-model="formData.note"
          placeholder="其他说明，最多200字"
          maxlength="200"
          @blur="validateField('note')"
        />
        <view class="char-count">{{ formData.note.length }}/200</view>
        <text v-if="errors.note" class="error-text">{{ errors.note }}</text>
      </view>
    </form>

    <!-- 发布按钮 -->
    <view class="submit-container">
      <button
        class="submit-button"
        :loading="loading"
        :disabled="loading"
        @click="handleSubmit"
      >
        {{ loading ? '发布中...' : '发布' }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import type { RideType, PublishRideParams } from '@/types'
import { publishRide } from '@/api/ride'

// 表单数据
const formData = reactive<PublishRideParams>({
  type: 'find-car',
  departure: '',
  destination: '',
  departureTime: '',
  seats: undefined,
  price: undefined,
  note: ''
})

// 错误信息
const errors = reactive({
  departure: '',
  destination: '',
  departureTime: '',
  seats: '',
  price: '',
  note: ''
})

// 加载状态
const loading = ref(false)

// 最小时间（当前时间）
const minDateTime = computed(() => {
  const now = new Date()
  return now.toISOString().slice(0, 16)
})

// 拼车类型切换
const onTypeChange = (e: any) => {
  formData.type = e.detail.value as RideType
  // 切换类型时清除座位数错误
  if (formData.type === 'find-car') {
    errors.seats = ''
    formData.seats = undefined
  }
}

// 时间选择
const onTimeChange = (e: any) => {
  formData.departureTime = e.detail.value
  validateField('departureTime')
}

// 字段验证函数
const validateField = (field: keyof typeof formData) => {
  errors[field as keyof typeof errors] = ''

  switch (field) {
    case 'departure':
    case 'destination':
      if (!formData[field]) {
        errors[field] = '此项为必填项'
      } else if (formData[field].length < 2) {
        errors[field] = '地点名称至少2个字符'
      } else if (formData[field].length > 50) {
        errors[field] = '地点名称最多50个字符'
      }
      break

    case 'departureTime':
      if (!formData.departureTime) {
        errors.departureTime = '请选择出发时间'
      }
      break

    case 'seats':
      if (formData.type === 'find-passenger') {
        if (!formData.seats) {
          errors.seats = '请填写座位数'
        } else if (formData.seats < 1 || formData.seats > 8) {
          errors.seats = '座位数应在1-8之间'
        }
      }
      break

    case 'price':
      if (formData.price !== undefined && formData.price !== null) {
        if (formData.price < 0) {
          errors.price = '价格不能为负数'
        } else if (formData.price > 9999) {
          errors.price = '价格不能超过9999元'
        }
      }
      break

    case 'note':
      if (formData.note && formData.note.length > 200) {
        errors.note = '备注不能超过200字符'
      }
      break
  }
}

// 完整表单验证
const validateForm = (): boolean => {
  // 验证所有必填字段
  validateField('departure')
  validateField('destination')
  validateField('departureTime')

  if (formData.type === 'find-passenger') {
    validateField('seats')
  }

  validateField('price')
  validateField('note')

  // 检查是否有错误
  return !Object.values(errors).some(error => error !== '')
}

// 表单重置
const resetForm = () => {
  formData.type = 'find-car'
  formData.departure = ''
  formData.destination = ''
  formData.departureTime = ''
  formData.seats = undefined
  formData.price = undefined
  formData.note = ''

  // 清除所有错误
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })
}

// 提交表单
const handleSubmit = async () => {
  // 完整验证
  if (!validateForm()) {
    // 找到第一个错误字段并提示
    const firstError = Object.entries(errors).find(([_, value]) => value !== '')
    if (firstError) {
      uni.showToast({
        title: firstError[1],
        icon: 'none'
      })
    }
    return
  }

  try {
    loading.value = true

    // 调用 API
    await publishRide(formData)

    // 成功提示
    uni.showToast({
      title: '发布成功',
      icon: 'success'
    })

    // 重置表单
    resetForm()

    // 延迟跳转到首页
    setTimeout(() => {
      uni.switchTab({
        url: '/pages/home/index'
      })
    }, 1500)
  } catch (error: any) {
    // 失败提示
    uni.showToast({
      title: error.message || '发布失败，请重试',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.publish-page {
  min-height: 100vh;
  background-color: #F5F5F5;
  padding-bottom: 120rpx;
}

.page-header {
  background-color: #FFFFFF;
  padding: 40rpx 32rpx;
  margin-bottom: 20rpx;

  .page-title {
    display: block;
    font-size: 36rpx;
    font-weight: bold;
    color: #333333;
    margin-bottom: 12rpx;
  }

  .page-desc {
    display: block;
    font-size: 26rpx;
    color: #999999;
  }
}

.publish-form {
  background-color: #FFFFFF;
  padding: 0 32rpx;
}

.form-section {
  padding: 32rpx 0;
  border-bottom: 1rpx solid #EEEEEE;

  &:last-child {
    border-bottom: none;
  }

  .section-title {
    font-size: 28rpx;
    color: #333333;
    margin-bottom: 20rpx;
    font-weight: 500;

    .required {
      color: #FF4444;
      margin-right: 4rpx;
    }
  }

  .radio-group {
    display: flex;
    flex-direction: column;
    gap: 24rpx;

    .radio-item {
      display: flex;
      align-items: center;
      gap: 16rpx;
      font-size: 28rpx;
      color: #333333;
    }
  }

  .form-input {
    width: 100%;
    height: 80rpx;
    padding: 0 24rpx;
    background-color: #F8F8F8;
    border-radius: 8rpx;
    font-size: 28rpx;
    color: #333333;
  }

  .picker-input {
    width: 100%;
    height: 80rpx;
    padding: 0 24rpx;
    background-color: #F8F8F8;
    border-radius: 8rpx;
    display: flex;
    align-items: center;

    .picker-value {
      font-size: 28rpx;
      color: #333333;
    }

    .picker-placeholder {
      font-size: 28rpx;
      color: #999999;
    }
  }

  .form-textarea {
    width: 100%;
    min-height: 160rpx;
    padding: 20rpx 24rpx;
    background-color: #F8F8F8;
    border-radius: 8rpx;
    font-size: 28rpx;
    color: #333333;
    line-height: 1.6;
  }

  .char-count {
    text-align: right;
    font-size: 24rpx;
    color: #999999;
    margin-top: 8rpx;
  }

  .error-text {
    display: block;
    font-size: 24rpx;
    color: #FF4444;
    margin-top: 12rpx;
  }
}

.submit-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 32rpx;
  background-color: #FFFFFF;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.08);

  .submit-button {
    width: 100%;
    height: 88rpx;
    background-color: #07C160;
    color: #FFFFFF;
    border-radius: 44rpx;
    font-size: 32rpx;
    font-weight: bold;
    border: none;
    line-height: 88rpx;

    &[disabled] {
      opacity: 0.6;
    }
  }
}
</style>
