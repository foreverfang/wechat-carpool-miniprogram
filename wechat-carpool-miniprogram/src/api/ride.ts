import request from '@/utils/request'
import type { Ride, RideType, PublishRideParams } from '@/types'

// 获取拼车列表
export const getRideList = (params: {
  type: RideType
  page: number
  pageSize?: number
}) => {
  return request<{ list: Ride[]; total: number }>({
    url: '/rides',
    method: 'GET',
    data: params
  })
}

// 发布拼车信息
export const publishRide = (params: PublishRideParams) => {
  return request<Ride>({
    url: '/rides',
    method: 'POST',
    data: params
  })
}

// 获取拼车详情
export const getRideDetail = (id: string) => {
  return request<Ride>({
    url: `/rides/${id}`,
    method: 'GET'
  })
}

// 取消拼车
export const cancelRide = (id: string) => {
  return request<void>({
    url: `/rides/${id}/cancel`,
    method: 'POST'
  })
}

// 搜索拼车
export const searchRides = (params: {
  keyword: string
  type?: RideType
}) => {
  return request<{ list: Ride[] }>({
    url: '/rides/search',
    method: 'GET',
    data: params
  })
}
