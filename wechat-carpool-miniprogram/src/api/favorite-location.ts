import request from '@/utils/request'

export interface FavoriteLocation {
  id: number
  name: string
  address: string
  latitude?: number
  longitude?: number
  useCount: number
  createdAt: string
}

export interface CreateFavoriteLocationDto {
  name: string
  address: string
  latitude?: number
  longitude?: number
}

export interface UpdateFavoriteLocationDto {
  name?: string
  address?: string
  latitude?: number
  longitude?: number
}

export const getFavoriteLocations = () => {
  return request<FavoriteLocation[]>({
    url: '/favorite-locations',
    method: 'GET',
  })
}

export const createFavoriteLocation = (data: CreateFavoriteLocationDto) => {
  return request<FavoriteLocation>({
    url: '/favorite-locations',
    method: 'POST',
    data,
  })
}

export const updateFavoriteLocation = (id: number, data: UpdateFavoriteLocationDto) => {
  return request<FavoriteLocation>({
    url: `/favorite-locations/${id}`,
    method: 'PATCH',
    data,
  })
}

export const deleteFavoriteLocation = (id: number) => {
  return request({
    url: `/favorite-locations/${id}`,
    method: 'DELETE',
  })
}

export const incrementFavoriteLocationUseCount = (id: number) => {
  return request({
    url: `/favorite-locations/${id}/increment`,
    method: 'POST',
  })
}
