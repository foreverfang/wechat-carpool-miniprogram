<template>
  <view class="records-container">
    <!-- 筛选标签 -->
    <view class="filter-tabs">
      <view
        v-for="tab in tabs"
        :key="tab.value"
        :class="['tab-item', activeTab === tab.value ? 'active' : '']"
        @click="switchTab(tab.value)"
      >
        {{ tab.label }}
      </view>
    </view>

    <!-- 记录列表 -->
    <scroll-view class="records-list" scroll-y>
      <view
        v-for="record in recordList"
        :key="record.id"
        class="record-card"
        @click="viewDetail(record)"
      >
        <view class="record-header">
          <view :class="['status-badge', record.status]">
            {{ getStatusText(record.status) }}
          </view>
          <text class="date">{{ record.date }}</text>
        </view>

        <view class="record-content">
          <view class="location-info">
            <view class="location-item">
              <text class="icon">📍</text>
              <text class="text">{{ record.departure }}</text>
            </view>
            <view class="arrow">→</view>
            <view class="location-item">
              <text class="icon">🎯</text>
              <text class="text">{{ record.destination }}</text>
            </view>
          </view>

          <view class="record-details">
            <text class="detail-item">
              {{ record.type === 'published' ? '发布' : '参与' }}
            </text>
            <text class="detail-item">💺 {{ record.seats }}人</text>
            <text class="detail-item">🕐 {{ record.time }}</text>
          </view>
        </view>

        <view class="record-footer" v-if="record.status === 'completed'">
          <button
            v-if="!record.rated"
            class="rate-btn"
            @click.stop="rateRide(record)"
          >
            评价
          </button>
          <text v-else class="rated-text">已评价</text>
        </view>
      </view>

      <view v-if="recordList.length === 0" class="empty">
        <text class="empty-icon">📋</text>
        <text class="empty-text">暂无记录</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getUserRides } from '@/api/user'

type RecordStatus = 'pending' | 'ongoing' | 'completed' | 'cancelled'
type RecordType = 'published' | 'joined'

interface Record {
  id: string
  type: RecordType
  status: RecordStatus
  departure: string
  destination: string
  date: string
  time: string
  seats: number
  rated: boolean
}

const tabs = [
  { label: '全部', value: 'all' },
  { label: '进行中', value: 'active' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' }
]

const activeTab = ref('all')
const recordList = ref<Record[]>([])

const switchTab = (tab: string) => {
  activeTab.value = tab
  loadRecords()
}

const loadRecords = async () => {
  try {
    const status = activeTab.value === 'all' ? undefined : activeTab.value
    const res = await getUserRides(status)
    recordList.value = (res || []).map((item: any) => {
      const dt = new Date(item.departureTime)
      return {
        id: String(item.id),
        type: 'published' as RecordType,
        status: item.status === 'active' ? 'ongoing' : item.status,
        departure: item.departure,
        destination: item.destination,
        date: dt.toLocaleDateString('zh-CN'),
        time: dt.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        seats: item.seats || 1,
        rated: false,
      }
    })
  } catch (error) {
    console.error('加载失败', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

const getStatusText = (status: RecordStatus) => {
  const statusMap = {
    pending: '待确认',
    ongoing: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusMap[status]
}

const viewDetail = (record: Record) => {
  console.log('查看详情', record)
}

const rateRide = (record: Record) => {
  uni.showToast({ title: '评价功能', icon: 'none' })
}

onMounted(() => {
  loadRecords()
})
</script>

<style scoped lang="scss">
.records-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.filter-tabs {
  display: flex;
  background-color: #fff;
  padding: 20rpx;
  gap: 16rpx;

  .tab-item {
    flex: 1;
    padding: 16rpx 0;
    text-align: center;
    font-size: 26rpx;
    color: #666;
    background-color: #f5f5f5;
    border-radius: 40rpx;

    &.active {
      background-color: #1890FF;
      color: #fff;
      font-weight: bold;
    }
  }
}

.records-list {
  height: calc(100vh - 120rpx);
  padding: 20rpx;
}

.record-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);

  .record-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;

    .status-badge {
      padding: 8rpx 20rpx;
      border-radius: 20rpx;
      font-size: 24rpx;
      color: #fff;

      &.pending {
        background-color: #faad14;
      }

      &.ongoing {
        background-color: #1989fa;
      }

      &.completed {
        background-color: #52c41a;
      }

      &.cancelled {
        background-color: #999;
      }
    }

    .date {
      font-size: 24rpx;
      color: #999;
    }
  }

  .record-content {
    .location-info {
      display: flex;
      align-items: center;
      margin-bottom: 20rpx;

      .location-item {
        flex: 1;
        display: flex;
        align-items: center;

        .icon {
          margin-right: 12rpx;
          font-size: 32rpx;
        }

        .text {
          font-size: 28rpx;
          color: #333;
        }
      }

      .arrow {
        margin: 0 20rpx;
        font-size: 32rpx;
        color: #999;
      }
    }

    .record-details {
      display: flex;
      gap: 24rpx;

      .detail-item {
        font-size: 24rpx;
        color: #666;
      }
    }
  }

  .record-footer {
    margin-top: 20rpx;
    padding-top: 20rpx;
    border-top: 1rpx solid #eee;
    display: flex;
    justify-content: flex-end;

    .rate-btn {
      padding: 12rpx 32rpx;
      background-color: #1890FF;
      color: #fff;
      border-radius: 40rpx;
      font-size: 26rpx;
      border: none;
    }

    .rated-text {
      font-size: 26rpx;
      color: #999;
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
