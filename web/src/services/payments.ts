import api from './api'

export interface PaymentItem {
  id: number
  student_id: number
  tutor_id: number
  lesson_id: number | null
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  description: string | null
  student?: { id: number; name: string }
  tutor?: { id: number; name: string }
  lesson?: any
  created_at: string
}

export const paymentService = {
  async checkout(lessonId: number) {
    const { data } = await api.post<{ data: any }>('/payments/checkout', { lesson_id: lessonId })
    return data.data
  },

  async confirm(paymentId: number) {
    const { data } = await api.post(`/payments/${paymentId}/confirm`)
    return data
  },

  async history() {
    const { data } = await api.get('/payments')
    return data
  },

  async get(id: number) {
    const { data } = await api.get<{ data: PaymentItem }>(`/payments/${id}`)
    return data.data
  },
}
