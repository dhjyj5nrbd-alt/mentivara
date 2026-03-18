import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService, type AdminUser } from '../../services/admin'
import { Check, X } from 'lucide-react'

export default function PendingTutors() {
  const queryClient = useQueryClient()

  const { data: tutors, isLoading } = useQuery({
    queryKey: ['admin', 'pending-tutors'],
    queryFn: adminService.pendingTutors,
  })

  const approveMutation = useMutation({
    mutationFn: (id: number) => adminService.approveTutor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (id: number) => adminService.rejectTutor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] })
    },
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
              <Link to="/admin/tutors-pending" className="text-white/90 hover:text-white">Pending Tutors</Link>
              <Link to="/admin/payments" className="text-white/60 hover:text-white">Payments</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-[#1E1B4B] mb-6">Pending Tutor Applications</h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7C3AED]" />
          </div>
        ) : !tutors?.length ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <p className="text-slate-500">No pending applications.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tutors.map((tutor: AdminUser) => (
              <div key={tutor.id} className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-900">{tutor.name}</h3>
                    <p className="text-sm text-slate-500">{tutor.email}</p>
                  </div>
                  <span className="text-xs text-slate-400">
                    Applied {new Date(tutor.created_at).toLocaleDateString('en-GB')}
                  </span>
                </div>

                {tutor.tutor_profile && (
                  <div className="mb-4 space-y-2">
                    {tutor.tutor_profile.bio && (
                      <div>
                        <span className="text-xs text-slate-500 font-medium">Bio:</span>
                        <p className="text-sm text-slate-700">{tutor.tutor_profile.bio}</p>
                      </div>
                    )}
                    {tutor.tutor_profile.qualifications && (
                      <div>
                        <span className="text-xs text-slate-500 font-medium">Qualifications:</span>
                        <p className="text-sm text-slate-700">{tutor.tutor_profile.qualifications}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => approveMutation.mutate(tutor.id)}
                    disabled={approveMutation.isPending}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700"
                  >
                    <Check className="w-4 h-4" /> Approve
                  </button>
                  <button
                    onClick={() => rejectMutation.mutate(tutor.id)}
                    disabled={rejectMutation.isPending}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                  >
                    <X className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
