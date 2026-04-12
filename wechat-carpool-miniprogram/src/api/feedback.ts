import request from '@/utils/request'

export const submitFeedback = (data: {
  type: 'suggestion' | 'bug' | 'other'
  content: string
  contactInfo?: string
}) => {
  return request<{ message: string }>({
    url: '/feedback',
    method: 'POST',
    data
  })
}
