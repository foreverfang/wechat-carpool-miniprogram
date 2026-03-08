<template>
  <view class="publish-container">
    <!-- 类型选择 -->
    <view class="type-selector">
      <view
        :class="['type-item', publishType === 'find-car' ? 'active' : '']"
        @click="publishType = 'find-car'"
      >
        <text class="icon">🙋</text>
        <text class="text">人找车</text>
      </view>
      <view
        :class="['type-item', publishType === 'find-passenger' ? 'active' : '']"
        @click="publishType = 'find-passenger'"
      >
        <text class="icon">🚗</text>
        <text class="text">车找人</text>
      </view>
    </view>

    <!-- 表单 -->
    <view class="form">
      <!-- 出发地 -->
      <view class="form-item">
        <text class="label">出发地</text>
        <view class="input-wrapper" @click="selectLocation('departure')">
          <input
            v-model="formData.departure"
            placeholder="请选择出发地"
            disabled
          />
          <text class="arrow">›</text>
        </view>
      </view>

      <!-- 目的地 -->
      <view class="form-item">
        <text class="label">目的地</text>
        <view class="input-wrapper" @click="selectLocation('destination')">
          <input
            v-model="formData.destination"
            placeholder="请选择目的地"
            disabled
          />
          <text class="arrow">›</text>
        </view>
      </view>

      <!-- 出发时间 -->
      <view class="form-item">
        <text class="label">出发时间</text>
        <picker
          mode="multiSelector"
          :value="timePickerValue"
          :range="timePickerRange"
          @change="onTimeChange"
        >
          <view class="input-wrapper">
            <input
              v-model="formData.departureTime"
              placeholder="请选择出发时间"
              disabled
            />
            <text class="arrow">›</text>
          </view>
        </picker>
      </view>

      <!-- 人数/座位数 -->
      <view class="form-item">
        <text class="label">
          {{ publishType === 'find-car' ? '乘车人数' : '可载人数' }}
        </text>
        <view class="stepper">
          <button class="stepper-btn" @click="decreaseSeats">-</button>
          <text class="stepper-value">{{ formData.seats }}</text>
          <button class="stepper-btn" @click="increaseSeats">+</button>
        </view>
      </view>

      <!-- 人找车：可接受距离 -->
      <view v-if="publishType === 'find-car'" class="form-item">
        <text class="label">可接受距离</text>
        <view class="distance-selector">
          <view
            v-for="dist in distanceOptions"
            :key="dist"
            :class="['distance-item', formData.acceptDistance === dist ? 'active' : '']"
            @click="formData.acceptDistance = dist"
          >
            {{ dist }}km
          </view>
        </view>
      </view>

      <!-- 车找人：路线说明 -->
      <view v-if="publishType === 'find-passenger'" class="form-item">
        <text class="label">路线说明</text>
        <textarea
          v-model="formData.route"
          placeholder="请描述您的行车路线"
          class="textarea"
          maxlength="200"
        />
      </view>

      <!-- 备注 -->
      <view class="form-item">
        <text class="label">备注</text>
        <textarea
          v-model="formData.note"
          placeholder="其他说明（选填）"
          class="textarea"
          maxlength="200"
        />
      </view>
    </view>

    <!-- 发布按钮 -->
    <view class="submit-wrapper">
      <button class="submit-btn" @click="handleSubmit">发布</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

type PublishType = 'find-car' | 'find-passenger'

const publishType = ref<PublishType>('find-car')

const formData = reactive({
  departure: '',
  destination: '',
  departureTime: '',
  seats: 1,
  acceptDistance: 3,
  route: '',
  note: ''
})

const distanceOptions = [1, 3, 5, 10]

const timePickerValue = ref([0, 0])
const timePickerRange = ref([
  ['今天', '明天', '后天'],
  Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`)
])

const selectLocation = (type: 'departure' | 'destination') => {
  // TODO: 调用地图选择位置
  uni.chooseLocation({
    success: (res) => {
      if (type === 'departure') {
        formData.departure = res.name || res.address
      } else {
        formData.destination = res.name || res.address
      }
    }
  })
}

const onTimeChange = (e: any) => {
  const [dayIndex, timeIndex] = e.detail.value
  const day = timePickerRange.value[0][dayIndex]
  const time = timePickerRange.value[1][timeIndex]
  formData.departureTime = `${day} ${time}`
  timePickerValue.value = e.detail.value
}

const decreaseSeats = () => {
  if (formData.seats > 1) {
    formData.seats--
  }
}

const increaseSeats = () => {
  if (formData.seats < 6) {
    formData.seats++
  }
}

const handleSubmit = async () => {
  // 表单验证
  if (!formData.departure) {
    uni.showToast({ title: '请选择出发地', icon: 'none' })
    return
  }
  if (!formData.destination) {
    uni.showToast({ title: '请选择目的地', icon: 'none' })
    return
  }
  if (!formData.departureTime) {
    uni.showToast({ title: '请选择出发时间', icon: 'none' })
    return
  }

  try {
    // TODO: 调用发布 API
    // await publishRide({ ...formData, type: publishType.value })

    uni.showToast({ title: '发布成功', icon: 'success' })

    // 延迟跳转到首页
    setTimeout(() => {
      uni.switchTab({ url: '/pages/home/index' })
    }, 1500)
  } catch (error) {
    console.error('发布失败', error)
    uni.showToast({ title: '发布失败', icon: 'none' })
  }
}
</script>

<style scoped lang="scss">
.publish-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120rpx;
}

.type-selector {
  display: flex;
  gap: 20rpx;
  padding: 20rpx;

  .type-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40rpx 0;
    background-color: #fff;
    border-radius: 16rpx;
    border: 2rpx solid #eee;
    transition: all 0.3s;

    .icon {
      font-size: 60rpx;
      margin-bottom: 16rpx;
    }

    .text {
      font-size: 28rpx;
      color: #666;
    }

    &.active {
      border-color: #07c160;
      background-color: #f0fdf4;

      .text {
        color: #07c160;
        font-weight: bold;
      }
    }
  }
}

.form {
  margin: 20rpx;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 0 24rpx;

  .form-item {
    padding: 32rpx 0;
    border-bottom: 1rpx solid #eee;

    &:last-child {
      border-bottom: none;
    }

    .label {
      display: block;
      font-size: 28rpx;
      color: #333;
      margin-bottom: 20rpx;
      font-weight: bold;
    }

    .input-wrapper {
      display: flex;
      align-items: center;

      input {
        flex: 1;
        font-size: 28rpx;
        color: #333;
      }

      .arrow {
        font-size: 40rpx;
        color: #ccc;
      }
    }

    .stepper {
      display: flex;
      align-items: center;
      gap: 24rpx;

      .stepper-btn {
        width: 60rpx;
        height: 60rpx;
        border-radius: 50%;
        background-color: #f5f5f5;
        border: none;
        font-size: 32rpx;
        color: #333;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .stepper-value {
        font-size: 32rpx;
        font-weight: bold;
        min-width: 60rpx;
        text-align: center;
      }
    }

    .distance-selector {
      display: flex;
      gap: 20rpx;

      .distance-item {
        flex: 1;
        padding: 16rpx 0;
        text-align: center;
        background-color: #f5f5f5;
        border-radius: 8rpx;
        font-size: 26rpx;
        color: #666;

        &.active {
          background-color: #07c160;
          color: #fff;
        }
      }
    }

    .textarea {
      width: 100%;
      min-height: 160rpx;
      padding: 20rpx;
      background-color: #f5f5f5;
      border-radius: 8rpx;
      font-size: 28rpx;
      line-height: 1.6;
    }
  }
}

.submit-wrapper {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx;
  background-color: #fff;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.08);

  .submit-btn {
    width: 100%;
    padding: 28rpx 0;
    background-color: #07c160;
    color: #fff;
    border-radius: 40rpx;
    font-size: 32rpx;
    font-weight: bold;
    border: none;
  }
}
</style>
