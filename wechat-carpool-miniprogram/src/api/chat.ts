import request from '@/utils/request'

// 获取 IM UserSig（用于登录腾讯云 IM）
export const getUserSig = () => {
  return request<{ imUserId: string; userSig: string; sdkAppId: number }>({
    url: '/chat/user-sig',
    method: 'GET',
  })
}

// 创建单聊会话（验证拼车关联）
export const createConversation = (targetUserId: number) => {
  return request<{ fromImId: string; toImId: string; conversationId: string }>({
    url: '/chat/conversation',
    method: 'POST',
    data: { targetUserId },
  })
}
