import request from '@/utils/request'
import type { Chat, Message } from '@/types'

// 获取聊天列表
export const getChatList = () => {
  return request<{ list: Chat[] }>({
    url: '/chats',
    method: 'GET'
  })
}

// 获取聊天消息
export const getMessages = (params: {
  userId: string
  page: number
  pageSize?: number
}) => {
  return request<{ list: Message[]; total: number }>({
    url: '/messages',
    method: 'GET',
    data: params
  })
}

// 发送消息
export const sendMessage = (data: {
  toUserId: string
  content: string
  type?: 'text' | 'image' | 'location'
}) => {
  return request<Message>({
    url: '/messages',
    method: 'POST',
    data
  })
}

// 标记消息已读
export const markAsRead = (userId: string) => {
  return request<void>({
    url: `/messages/read/${userId}`,
    method: 'POST'
  })
}
