import { useQuery } from '@tanstack/react-query'
import { paymentService, type PaymentItem } from '../services/payments'
import { useAuthStore } from '../store/authStore'
import { CreditCard } from 'lucide-react'
import Layout from '../components/Layout'

export default function Payments() {
  const { user } = useAuthStore()
  const { data, isLoading, error } = useQuery({
    queryKey: ['payments'],
    queryFn: paymentService.history,
  })

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700',
    completed: 'bg-emerald-50 text-emerald-700',
    failed: 'bg-red-50 text-red-700',
    refunded: 'bg-slate-100 text-slate-600',
  }

  const statusLabels: Record<string, string> = {
    pending: 'Pending',
    completed: 'Completed',
    failed: 'Failed',
    refunded: 'Refunded',
  }

  const formatCurrency = (amount: number, currency: string) =>
    new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount / 100)

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-[#1E1B4B] dark:text-white mb-6">
          {user?.role === 'tutor' ? 'Earnings' : 'Payment History'}
        </h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7C3AED]" />
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-red-200">
            <p className="text-red-600 mb-4">Failed to load payment history.</p>
            <button onClick={() => window.location.reload()} className="text-[#7C3AED] hover:underline font-medium">Retry</button>
          </div>
        ) : !data?.data?.length ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <CreditCard className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">No payments yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.data.map((payment: PaymentItem) => (
              <div key={payment.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {user?.role === 'student' ? payment.tutor?.name : payment.student?.name}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {new Date(payment.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[payment.status]}`}>
                    {statusLabels[payment.status] || payment.status}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(payment.amount, payment.currency)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
