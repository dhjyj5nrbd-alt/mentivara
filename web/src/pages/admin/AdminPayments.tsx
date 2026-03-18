import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'

export default function AdminPayments() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'payments'],
    queryFn: async () => {
      const { data } = await api.get('/admin/payments')
      return data
    },
  })

  const refundMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.post(`/admin/payments/${id}/refund`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'payments'] }),
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-[#1E1B4B] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-14">
          <div className="flex items-center gap-6">
            <span className="font-bold text-lg">Mentivara Admin</span>
            <nav className="flex gap-4 text-sm">
              <Link to="/admin" className="text-white/60 hover:text-white">Dashboard</Link>
              <Link to="/admin/users" className="text-white/60 hover:text-white">Users</Link>
              <Link to="/admin/tutors-pending" className="text-white/60 hover:text-white">Pending Tutors</Link>
              <Link to="/admin/payments" className="text-white/90 hover:text-white">Payments</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-[#1E1B4B] mb-6">Payments</h1>

        {/* Stats */}
        {data?.stats && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <p className="text-2xl font-bold text-slate-900">£{(data.stats.total_revenue / 100).toFixed(2)}</p>
              <p className="text-xs text-slate-500">Total Revenue</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <p className="text-2xl font-bold text-slate-900">{data.stats.total_payments}</p>
              <p className="text-xs text-slate-500">Completed</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <p className="text-2xl font-bold text-amber-600">{data.stats.pending_payments}</p>
              <p className="text-xs text-slate-500">Pending</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <p className="text-2xl font-bold text-slate-900">£{(data.stats.refunded_total / 100).toFixed(2)}</p>
              <p className="text-xs text-slate-500">Refunded</p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7C3AED]" />
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-600">Student</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Tutor</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Amount</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Date</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.payments?.data?.map((p: any) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3">{p.student?.name}</td>
                    <td className="px-4 py-3">{p.tutor?.name}</td>
                    <td className="px-4 py-3 font-medium">£{(p.amount / 100).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        p.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                        p.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                        p.status === 'refunded' ? 'bg-slate-100 text-slate-600' :
                        'bg-red-50 text-red-700'
                      }`}>{p.status}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{new Date(p.created_at).toLocaleDateString('en-GB')}</td>
                    <td className="px-4 py-3">
                      {p.status === 'completed' && (
                        <button
                          onClick={() => { if (confirm('Refund this payment?')) refundMutation.mutate(p.id) }}
                          className="text-xs text-red-600 hover:underline"
                        >
                          Refund
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
