<template>
  <view v-if="rides.length > 0" class="historyRides">
    <view class="sectionTitle">历史行程</view>
    <view
      v-for="(ride, index) in rides"
      :key="index"
      class="rideCard"
      :class="{ selected: selectedId === ride.id }"
      @click="selectRide(ride)"
    >
      <view class="rideRoute">
        <text class="icon">📍</text>
        <text class="routeText">{{ ride.departure }}</text>
        <text class="arrow">→</text>
        <text class="icon">🎯</text>
        <text class="routeText">{{ ride.destination }}</text>
      </view>
      <view class="rideInfo">
        <text class="date">{{ formatDate(ride.departureTime) }}</text>
        <text class="type">{{ ride.type === 'find-car' ? '找车' : '找乘客' }}</text>
      </view>
    </view>
    <view class="viewMore" @click="viewMore">
      <text>查看更多历史 ›</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { RideHistory } from '../../../api/ride'

interface Props {
  rides: RideHistory[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  selectRide: [ride: RideHistory]
  viewMore: []
}>()

const selectedId = ref<number | null>(null)

const selectRide = (ride: RideHistory) => {
  selectedId.value = ride.id
  emit('selectRide', ride)
}

const viewMore = () => {
  emit('viewMore')
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}
</script>

<style scoped>
.historyRides {
  padding: 20rpx 30rpx;
  background: #fff;
  margin-bottom: 20rpx;
}

.sectionTitle {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
}

.rideCard {
  padding: 24rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  margin-bottom: 16rpx;
  border: 2rpx solid transparent;
}

.rideCard.selected {
  border-color: #1890ff;
  background: #e6f7ff;
}

.rideRoute {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.rideRoute .icon {
  font-size: 24rpx;
  margin-right: 8rpx;
}

.routeText {
  font-size: 26rpx;
  color: #333;
  max-width: 200rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.arrow {
  margin: 0 12rpx;
  color: #999;
  font-size: 24rpx;
}

.rideInfo {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.date {
  font-size: 24rpx;
  color: #666;
}

.type {
  font-size: 22rpx;
  color: #1890ff;
  padding: 4rpx 12rpx;
  background: #e6f7ff;
  border-radius: 4rpx;
}

.viewMore {
  text-align: center;
  padding: 20rpx 0;
  color: #1890ff;
  font-size: 26rpx;
}
</style>
