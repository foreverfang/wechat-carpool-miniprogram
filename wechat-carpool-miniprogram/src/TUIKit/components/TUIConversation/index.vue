<template>
  <view class="tuikit-conversation-page">
    <TUIConversation @handleSwitchConversation="handleSwitchConversation" />
  </view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app';
import TUIConversation from '@tencentcloud/chat-uikit-uniapp/components/TUIConversation/index.vue';
import { timLogin } from '../../../utils/tim';

onLoad(async () => {
  await timLogin();
});

const handleSwitchConversation = (conversationID: string) => {
  uni.navigateTo({
    url: `/TUIKit/components/TUIChat/index?conversationID=${conversationID}`,
  });
};
</script>

<style scoped>
.tuikit-conversation-page {
  height: 100vh;
}
</style>
