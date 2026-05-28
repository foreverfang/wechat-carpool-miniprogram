<template>
  <view v-if="hasHistory" class="quickActions">
    <button
      class="quickBtn"
      :class="{ loaded: isLoaded }"
      @click="loadLastRide"
    >
      <text class="icon">🚀</text>
      <text>{{ isLoaded ? '已加载上次行程' : '使用上次行程' }}</text>
    </button>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  hasHistory: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  loadLastRide: []
}>()

const isLoaded = ref(false)

const loadLastRide = () => {
  if (isLoaded.value) return
  emit('loadLastRide')
  isLoaded.value = true
}
</script>

<style scoped>
.quickActions {
  padding: 20rpx 30rpx;
  background: #fff;
  margin-bottom: 20rpx;
}

.quickBtn {
  width: 100%;
  height: 80rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 28rpx;
  border: none;
}

.quickBtn.loaded {
  background: #e0e0e0;
  color: #999;
}

.quickBtn .icon {
  margin-right: 10rpx;
  font-size: 32rpx;
}
</style>
