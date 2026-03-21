// 拼车相关类型定义

export interface LocationPoint {
  name: string
  latitude: number
  longitude: number
}

export type RideType = 'find-car' | 'find-passenger'
export type RideStatus = 'pending' | 'ongoing' | 'completed' | 'cancelled'

export interface Ride {
  id: string
  type: RideType
  userId: string
  avatar: string
  username: string
  rating: number
  departure: string
  departureLocation: LocationPoint
  destination: string
  destinationLocation: LocationPoint
  waypoints?: LocationPoint[]
  departureTime: string
  seats: number
  acceptDistance?: number // 人找车：可接受距离
  route?: string // 车找人：路线说明
  distance?: number
  note?: string
  status: RideStatus
  publishTime: string
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  openid: string
  avatar: string
  username: string
  phone?: string
  rating: number
  verified: boolean
  createdAt: string
}

export interface Message {
  id: string
  fromUserId: string
  toUserId: string
  content: string
  type: 'text' | 'image' | 'location'
  createdAt: string
  read: boolean
}

export interface Chat {
  id: string
  userId: string
  avatar: string
  username: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
}

export interface Rating {
  id: string
  rideId: string
  fromUserId: string
  toUserId: string
  score: number
  comment: string
  createdAt: string
}

export interface Statistics {
  totalRides: number
  totalDistance: number
  totalPeople: number
  carbonReduction: number
  publishedCount: number
  joinedCount: number
  completedCount: number
}

// 发布拼车信息的参数
export interface PublishRideParams {
  type: RideType
  departure: string
  departureLocation?: LocationPoint
  destination: string
  destinationLocation?: LocationPoint
  waypoints?: LocationPoint[]
  departureTime: string
  seats?: number
  price?: number
  note?: string
}
