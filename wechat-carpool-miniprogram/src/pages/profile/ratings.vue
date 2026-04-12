<template>
  <view class="ratings-container">
    <!-- Tab 切换 -->
    <view class="tab-bar">
      <view
        :class="['tab-item', activeTab === 'received' ? 'active' : '']"
        @click="switchTab('received')"
      >
        收到的评价
      </view>
      <view
        :class="['tab-item', activeTab === 'given' ? 'active' : '']"
        @click="switchTab('given')"
      >
        我发出的评价
      </view>
    </view>

    <!-- 评价列表 -->
    <scroll-view class="list" scroll-y>
      <view v-if="loading" class="loading-tip">
        <text>加载中...</text>
      </view>

      <view
        v-for="item in list"
        :key="item.id"
        class="rating-card"
      >
        <!-- 星级 -->
        <view class="stars">
          <text
            v-for="n in 5"
            :key="n"
            :class="['star', n <= item.score ? 'filled' : '']"
          >★</text>
          <text class="score-text">{{ item.score }}.0</text>
        </view>

        <!-- 评论 -->
        <text class="comment">{{ item.comment || '该用户未留下评论' }}</text>

        <!-- 时间 -->
        <text class="time">{{ formatDate(item.createdAt) }}</text>
      </view>

      <view v-if="!loading && list.length === 0" class="empty">
        <text class="empty-icon">⭐</text>
        <text class="empty-text">暂无{{ activeTab === 'received' ? '收到的' : '发出的' }}评价</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getReceivedRatings, getGivenRatings } from '@/api/user'

interface RatingItem {
  id: number
  score: number
  comment: string
  createdAt: string
}

const activeTab = ref<'received' | 'given'>('received')
const list = ref<RatingItem[]>([])
const loading = ref(false)

const loadData = async () => {
  loading.value = true
  try {
    const res = activeTab.value === 'received'
      ? await getReceivedRatings()
      : await getGivenRatings()
    list.value = (res as any[]) || []
  } catch {
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const switchTab = (tab: 'received' | 'given') => {
  activeTab.value = tab
  loadData()
}

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.ratings-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.tab-bar {
  display: flex;
  background-color: #fff;
  border-bottom: 1rpx solid #eee;

  .tab-item {
    flex: 1;
    text-align: center;
    padding: 28rpx 0;
    font-size: 28rpx;
    color: #666;
    position: relative;

    &.active {
      color: #1890FF;
      font-weight: bold;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 60rpx;
        height: 6rpx;
        background-color: #1890FF;
        border-radius: 3rpx;
      }
    }
  }
}

.list {
  height: calc(100vh - 100rpx);
  padding: 20rpx;
}

.loading-tip {
  padding: 60rpx;
  text-align: center;
  color: #999;
  font-size: 26rpx;
}

.rating-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);

  .stars {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;

    .star {
      font-size: 36rpx;
      color: #ddd;
      margin-right: 4rpx;

      &.filled {
        color: #faad14;
      }
    }

    .score-text {
      font-size: 26rpx;
      color: #faad14;
      margin-left: 12rpx;
      font-weight: bold;
    }
  }

  .comment {
    display: block;
    font-size: 28rpx;
    color: #333;
    line-height: 1.6;
    margin-bottom: 20rpx;
  }

  .time {
    font-size: 24rpx;
    color: #bbb;
  }
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 200rpx 0;

  .empty-icon {
    font-size: 100rpx;
    margin-bottom: 24rpx;
    opacity: 0.3;
  }

  .empty-text {
    font-size: 28rpx;
    color: #999;
  }
}
</style>
