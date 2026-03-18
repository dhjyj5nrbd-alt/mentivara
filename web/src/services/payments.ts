import api from './api'
import type { PaginatedResponse } from './types'

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

export interface CheckoutResult {
  payment_id: number
  amount: string
  currency: string
  status: string
}

export const paymentService = {
  async checkout(lessonId: number): Promise<CheckoutResult> {
    const { data } = await api.post<{ data: CheckoutResult }>('/payments/checkout', { lesson_id: lessonId })
    return data.data
  },

  async confirm(paymentId: number): Promise<{ message: string; data: PaymentItem }> {
    const { data } = await api.post<{ message: string; data: PaymentItem }>(`/payments/${paymentId}/confirm`)
    return data
  },

  async history(): Promise<PaginatedResponse<PaymentItem>> {
    const { data } = await api.get<PaginatedResponse<PaymentItem>>('/payments')
    return data
  },

  async get(id: number): Promise<PaymentItem> {
    const { data } = await api.get<{ data: PaymentItem }>(`/payments/${id}`)
    return data.data
  },
}
