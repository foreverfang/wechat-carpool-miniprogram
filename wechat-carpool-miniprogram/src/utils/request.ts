// 开发环境使用局域网 IP,真机预览时可访问
// 生产环境需要改为实际的服务器地址
const BASE_URL = 'http://192.168.3.98:3000/api'

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: any
}

const getToken = (): string => {
  return uni.getStorageSync('token') || ''
}

const request = <T>(options: RequestOptions): Promise<T> => {
  return new Promise((resolve, reject) => {
    const token = getToken()
    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.header,
      },
      success: (res: any) => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve(res.data?.data ?? res.data)
        } else if (res.statusCode === 401) {
          uni.removeStorageSync('token')
          uni.reLaunch({ url: '/pages/home/index' })
          reject(res.data)
        } else {
          const msg = res.data?.message
          const title = Array.isArray(msg) ? msg[0] : (msg || '请求失败')
          uni.showToast({ title, icon: 'none' })
          reject(res.data)
        }
      },
      fail: (err) => {
        uni.showToast({ title: '网络错误', icon: 'none' })
        reject(err)
      },
    })
  })
}

export default request
