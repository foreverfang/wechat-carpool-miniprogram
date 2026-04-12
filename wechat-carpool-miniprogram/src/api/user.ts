import request from '@/utils/request'
import type { User, Statistics, Rating } from '@/types'

// 获取用户信息
export const getUserInfo = () => {
  return request<User>({
    url: '/users/profile',
    method: 'GET'
  })
}

// 更新用户信息
export const updateUserInfo = (data: Partial<User>) => {
  return request<User>({
    url: '/users/profile',
    method: 'PATCH',
    data
  })
}

// 获取用户统计数据
export const getUserStatistics = () => {
  return request<Statistics>({
    url: '/users/statistics',
    method: 'GET'
  })
}

// 获取用户拼车记录
export const getUserRides = (status?: string) => {
  return request<any[]>({
    url: '/users/rides',
    method: 'GET',
    data: status ? { status } : undefined
  })
}

// 微信登录
export const wxLogin = (code: string) => {
  return request<{ token: string; user: User }>({
    url: '/auth/wechat-login',
    method: 'POST',
    data: { code }
  })
}

// 实名认证
export const verifyIdentity = (data: {
  realName: string
  idCard: string
}) => {
  return request<void>({
    url: '/users/verify',
    method: 'POST',
    data
  })
}

// 获取收到的评价
export const getReceivedRatings = () => {
  return request<Rating[]>({
    url: '/users/ratings/received',
    method: 'GET'
  })
}

// 获取发出的评价
export const getGivenRatings = () => {
  return request<Rating[]>({
    url: '/users/ratings/given',
    method: 'GET'
  })
}

// 更新通知设置
export const updateSettings = (data: { notifyRideMatch?: boolean }) => {
  return request<{ notifyRideMatch: boolean }>({
    url: '/users/settings',
    method: 'PATCH',
    data
  })
}
