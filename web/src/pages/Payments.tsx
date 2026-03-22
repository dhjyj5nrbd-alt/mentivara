import { useQuery } from '@tanstack/react-query'
import { paymentService, type PaymentItem } from '../services/payments'
import { useAuthStore } from '../store/authStore'
import { CreditCard, AlertCircle } from 'lucide-react'
import Layout from '../components/Layout'

export default function Payments() {
  const { user } = useAuthStore()
  const { data, isLoading, isError, refetch } = useQuery({
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
        ) : isError ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center p-8 bg-rose-50 dark:bg-rose-900/20 rounded-2xl max-w-md">
              <div className="w-12 h-12 bg-rose-100 dark:bg-rose-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-rose-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Something went wrong</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">Failed to load payment history. Please try again.</p>
              <button onClick={() => refetch()} className="px-4 py-2 bg-[#7C3AED] text-white rounded-lg hover:bg-[#6D28D9] transition-colors">
                Try again
              </button>
            </div>
          </div>
        ) : !data?.data?.length ? (
          <div className="text-center py-12 bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536]">
            <CreditCard className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">No payments yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.data.map((payment: PaymentItem) => (
              <div key={payment.id} className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] p-5 flex items-center justify-between">
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
