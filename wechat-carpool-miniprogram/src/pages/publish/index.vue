<template>
  <view class="publish-page">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">发布拼车信息</text>
      <text class="page-desc">填写以下信息发布您的拼车需求</text>
    </view>

    <!-- 表单容器 -->
    <view class="publish-form">
      <!-- 拼车类型选择器 -->
      <view class="form-section">
        <view class="section-title">
          <text class="required">*</text>
          <text>拼车类型</text>
        </view>
        <radio-group class="radio-group" @change="onTypeChange">
          <label class="radio-item">
            <radio value="find-car" :checked="formData.type === 'find-car'" color="#1890FF" />
            <text>找车（我是乘客）</text>
          </label>
          <label class="radio-item">
            <radio value="find-passenger" :checked="formData.type === 'find-passenger'" color="#1890FF" />
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
        <view class="location-picker" @click="chooseLocation('departure')">
          <text class="location-icon">📍</text>
          <text :class="formData.departure ? 'location-text' : 'location-placeholder'">
            {{ formData.departure || '点击选择出发地' }}
          </text>
          <text class="location-arrow">›</text>
        </view>
        <text v-if="errors.departure" class="error-text">{{ errors.departure }}</text>
      </view>

      <!-- 目的地 -->
      <view class="form-section">
        <view class="section-title">
          <text class="required">*</text>
          <text>目的地</text>
        </view>
        <view class="location-picker" @click="chooseLocation('destination')">
          <text class="location-icon">📍</text>
          <text :class="formData.destination ? 'location-text' : 'location-placeholder'">
            {{ formData.destination || '点击选择目的地' }}
          </text>
          <text class="location-arrow">›</text>
        </view>
        <text v-if="errors.destination" class="error-text">{{ errors.destination }}</text>
      </view>

      <!-- 途径点（仅车找人） -->
      <view class="form-section" v-if="formData.type === 'find-passenger'">
        <view class="section-title">
          <text>途径点（可选，最多3个）</text>
        </view>
        <view
          v-for="(wp, index) in formData.waypoints"
          :key="index"
          class="waypoint-item"
        >
          <text class="location-icon">🔵</text>
          <text class="location-text">{{ wp.name }}</text>
          <text class="waypoint-delete" @click="removeWaypoint(index)">✕</text>
        </view>
        <view
          class="add-waypoint-btn"
          :class="{ disabled: (formData.waypoints?.length ?? 0) >= 3 }"
          @click="addWaypoint"
        >
          <text>+ 添加途径点</text>
        </view>
      </view>

      <!-- 出发时间 -->
      <view class="form-section">
        <view class="section-title">
          <text class="required">*</text>
          <text>出发时间</text>
        </view>
        <view class="datetime-row">
          <picker
            mode="date"
            :value="selectedDate"
            :start="minDate"
            @change="onDateChange"
            style="flex: 1"
          >
            <view class="picker-input">
              <text :class="selectedDate ? 'picker-value' : 'picker-placeholder'">
                {{ selectedDate || '选择日期' }}
              </text>
            </view>
          </picker>
          <picker
            mode="time"
            :value="selectedTime"
            @change="onTimePickerChange"
            style="flex: 1"
          >
            <view class="picker-input">
              <text :class="selectedTime ? 'picker-value' : 'picker-placeholder'">
                {{ selectedTime || '选择时间' }}
              </text>
            </view>
          </picker>
        </view>
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
    </view>

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
  departureLocation: undefined,
  destination: '',
  destinationLocation: undefined,
  waypoints: [],
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

// 最小日期
const minDate = computed(() => {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
})

// 日期和时间分开存储
const selectedDate = ref('')
const selectedTime = ref('')

// 日期选择
const onDateChange = (e: any) => {
  selectedDate.value = e.detail.value
  updateDepartureTime()
}

// 时间选择
const onTimePickerChange = (e: any) => {
  selectedTime.value = e.detail.value
  updateDepartureTime()
}

// 合并日期时间
const updateDepartureTime = () => {
  if (selectedDate.value && selectedTime.value) {
    formData.departureTime = `${selectedDate.value} ${selectedTime.value}`
  } else if (selectedDate.value) {
    formData.departureTime = selectedDate.value
  }
  validateField('departureTime')
}
// 地图选点（uni.chooseLocation 在微信小程序中编译为 wx.chooseLocation）
const chooseLocation = (field: 'departure' | 'destination') => {
  uni.chooseLocation({
    success: (res: any) => {
      if (field === 'departure') {
        formData.departure = res.name || res.address
        formData.departureLocation = {
          name: res.name || res.address,
          latitude: res.latitude,
          longitude: res.longitude
        }
      } else {
        formData.destination = res.name || res.address
        formData.destinationLocation = {
          name: res.name || res.address,
          latitude: res.latitude,
          longitude: res.longitude
        }
      }
      validateField(field)
    },
    fail: (err: any) => {
      if (!err.errMsg?.includes('cancel')) {
        uni.showToast({ title: '获取位置失败，请检查定位权限', icon: 'none' })
      }
    }
  })
}

// 添加途径点
const addWaypoint = () => {
  if ((formData.waypoints?.length ?? 0) >= 3) return
  uni.chooseLocation({
    success: (res: any) => {
      if (!formData.waypoints) formData.waypoints = []
      formData.waypoints.push({
        name: res.name || res.address,
        latitude: res.latitude,
        longitude: res.longitude
      })
    },
    fail: (err: any) => {
      if (!err.errMsg?.includes('cancel')) {
        uni.showToast({ title: '获取位置失败，请检查定位权限', icon: 'none' })
      }
    }
  })
}

// 删除途径点
const removeWaypoint = (index: number) => {
  formData.waypoints?.splice(index, 1)
}

const onTypeChange = (e: any) => {
  formData.type = e.detail.value as RideType
  // 切换类型时清除座位数错误
  if (formData.type === 'find-car') {
    errors.seats = ''
    formData.seats = undefined
  }
}

// 字段验证函数
const validateField = (field: keyof typeof formData) => {
  errors[field as keyof typeof errors] = ''

  switch (field) {
    case 'departure':
    case 'destination':
      if (!formData[field]) {
        errors[field] = '请通过地图选择地点'
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
  formData.departureLocation = undefined
  formData.destinationLocation = undefined
  formData.waypoints = []

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
  padding: 24rpx 24rpx calc(140rpx + env(safe-area-inset-bottom));
}

.page-header {
  background-color: #FFFFFF;
  padding: 40rpx 48rpx;
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
  padding: 0 48rpx;
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
    box-sizing: border-box;
  }

  .datetime-row {
    display: flex;
    gap: 16rpx;
  }

  .picker-input {
    width: 100%;
    height: 80rpx;
    padding: 0 24rpx;
    background-color: #F8F8F8;
    border-radius: 8rpx;
    display: flex;
    align-items: center;
    box-sizing: border-box;

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
    box-sizing: border-box;
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
  padding: 20rpx 48rpx;
  background-color: #FFFFFF;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.08);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;

  .submit-button {
    width: 100%;
    height: 88rpx;
    background-color: #1890FF;
    color: #FFFFFF;
    border-radius: 44rpx;
    font-size: 32rpx;
    font-weight: bold;
    border: none;
    line-height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: center;

    &[disabled] {
      opacity: 0.6;
    }
  }
}
.location-picker {
  display: flex;
  align-items: center;
  padding: 24rpx 20rpx;
  background: #F5F5F5;
  border-radius: 12rpx;
  min-height: 80rpx;

  .location-icon {
    font-size: 32rpx;
    margin-right: 12rpx;
  }

  .location-text {
    flex: 1;
    font-size: 28rpx;
    color: #333;
  }

  .location-placeholder {
    flex: 1;
    font-size: 28rpx;
    color: #BFBFBF;
  }

  .location-arrow {
    font-size: 36rpx;
    color: #BFBFBF;
  }
}

.waypoint-item {
  display: flex;
  align-items: center;
  padding: 16rpx 20rpx;
  background: #F5F5F5;
  border-radius: 12rpx;
  margin-bottom: 12rpx;

  .location-icon {
    font-size: 28rpx;
    margin-right: 12rpx;
  }

  .location-text {
    flex: 1;
    font-size: 28rpx;
    color: #333;
  }

  .waypoint-delete {
    font-size: 28rpx;
    color: #999;
    padding: 0 8rpx;
  }
}

.add-waypoint-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx;
  border: 2rpx dashed #1890FF;
  border-radius: 12rpx;
  color: #1890FF;
  font-size: 28rpx;

  &.disabled {
    border-color: #D9D9D9;
    color: #BFBFBF;
  }
}
</style>
