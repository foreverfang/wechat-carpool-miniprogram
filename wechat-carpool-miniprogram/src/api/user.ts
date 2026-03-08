import request from '@/utils/request'
import type { User, Statistics } from '@/types'

// 获取用户信息
export const getUserInfo = () => {
  return request<User>({
    url: '/user/info',
    method: 'GET'
  })
}

// 更新用户信息
export const updateUserInfo = (data: Partial<User>) => {
  return request<User>({
    url: '/user/info',
    method: 'PUT',
    data
  })
}

// 获取用户统计数据
export const getUserStatistics = () => {
  return request<Statistics>({
    url: '/user/statistics',
    method: 'GET'
  })
}

// 微信登录
export const wxLogin = (code: string) => {
  return request<{ token: string; user: User }>({
    url: '/auth/wx-login',
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
    url: '/user/verify',
    method: 'POST',
    data
  })
}
