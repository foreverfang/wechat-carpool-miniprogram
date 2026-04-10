<template>
  <view class="custom-tab-bar">
    <view
      v-for="(item, index) in tabList"
      :key="index"
      class="tab-item"
      @click="switchTab(index)"
    >
      <text
        class="iconfont"
        :class="currentIndex === index ? 'active' : ''"
        :style="{ color: currentIndex === index ? '#1890FF' : '#999999' }"
      >
        {{ item.icon }}
      </text>
      <text
        class="tab-text"
        :style="{ color: currentIndex === index ? '#1890FF' : '#999999' }"
      >
        {{ item.text }}
      </text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface TabItem {
  pagePath: string
  text: string
  icon: string
}

const tabList: TabItem[] = [
  { pagePath: '/pages/home/index', text: '首页', icon: '🏠' },
  { pagePath: '/pages/publish/index', text: '发布', icon: '➕' },
  { pagePath: '/pages/chat/index', text: '消息', icon: '💬' },
  { pagePath: '/pages/profile/index', text: '我的', icon: '👤' }
]

const currentIndex = ref(0)

const switchTab = (index: number) => {
  currentIndex.value = index
  uni.switchTab({
    url: tabList[index].pagePath
  })
}

onMounted(() => {
  // 获取当前页面路径
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const route = '/' + currentPage.route

  // 设置当前激活的 tab
  const index = tabList.findIndex(item => item.pagePath === route)
  if (index !== -1) {
    currentIndex.value = index
  }
})
</script>

<style scoped lang="scss">
.custom-tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  background-color: #FFFFFF;
  border-top: 1rpx solid #EEEEEE;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 1000;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;

  .iconfont {
    font-size: 44rpx;
    transition: color 0.3s;
  }

  .tab-text {
    font-size: 20rpx;
    transition: color 0.3s;
  }
}
</style>
