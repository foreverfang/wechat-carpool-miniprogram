<template>
  <view class="tuikit-chat-page">
    <TUIChat />
  </view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app';
import { TUIConversationService } from '@tencentcloud/chat-uikit-engine-lite';
import TUIChat from '@tencentcloud/chat-uikit-uniapp/components/TUIChat/index.vue';
import { timLogin } from '../../../utils/tim';

onLoad(async (options) => {
  await timLogin();

  if (options?.conversationID) {
    const { conversationID } = options;
    if (conversationID.startsWith('C2C') || conversationID.startsWith('GROUP')) {
      TUIConversationService.switchConversation(conversationID);
    }
  }
});
</script>

<style scoped>
.tuikit-chat-page {
  height: 100vh;
}
</style>
