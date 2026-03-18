import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '../../services/admin'
import { Search } from 'lucide-react'

export default function AdminUsers() {
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', { role, status, search }],
    queryFn: () => adminService.users({ role: role || undefined, status: status || undefined, search: search || undefined }),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, newStatus }: { id: number; newStatus: string }) => adminService.updateUserStatus(id, newStatus),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })

  const statusBadge = (s: string) => {
    const colors: Record<string, string> = {
      active: 'bg-emerald-50 text-emerald-700',
      pending: 'bg-amber-50 text-amber-700',
      suspended: 'bg-red-50 text-red-700',
    }
    return colors[s] || 'bg-slate-100 text-slate-600'
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-[#1E1B4B] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-14">
          <div className="flex items-center gap-6">
            <span className="font-bold text-lg">Mentivara Admin</span>
            <nav className="flex gap-4 text-sm">
              <Link to="/admin" className="text-white/60 hover:text-white">Dashboard</Link>
              <Link to="/admin/users" className="text-white/90 hover:text-white">Users</Link>
              <Link to="/admin/tutors-pending" className="text-white/60 hover:text-white">Pending Tutors</Link>
              <Link to="/admin/payments" className="text-white/60 hover:text-white">Payments</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-[#1E1B4B] mb-6">Users</h1>

        <div className="flex flex-wrap gap-3 mb-6">
          <form onSubmit={(e) => { e.preventDefault(); setSearch(searchInput) }} className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search users..."
                className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-[#7C3AED] text-white text-sm rounded-lg">Search</button>
          </form>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white">
            <option value="">All Roles</option>
            <option value="student">Students</option>
            <option value="tutor">Tutors</option>
            <option value="parent">Parents</option>
            <option value="admin">Admins</option>
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7C3AED]" />
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-600">Name</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Email</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Role</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.data?.map((user: any) => (
                  <tr key={user.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">{user.name}</td>
                    <td className="px-4 py-3 text-slate-600">{user.email}</td>
                    <td className="px-4 py-3"><span className="capitalize">{user.role}</span></td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusBadge(user.status)}`}>{user.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {user.status !== 'active' && (
                          <button onClick={() => statusMutation.mutate({ id: user.id, newStatus: 'active' })} className="text-xs text-emerald-600 hover:underline">Activate</button>
                        )}
                        {user.status !== 'suspended' && user.role !== 'admin' && (
                          <button onClick={() => statusMutation.mutate({ id: user.id, newStatus: 'suspended' })} className="text-xs text-red-600 hover:underline">Suspend</button>
                        )}
                        {user.role !== 'admin' && (
                          <button onClick={() => { if (confirm('Delete this user?')) deleteMutation.mutate(user.id) }} className="text-xs text-red-600 hover:underline">Delete</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(data?.total ?? data?.meta?.total) ? (
              <div className="px-4 py-3 bg-slate-50 text-xs text-slate-500">{data?.total ?? data?.meta?.total} users total</div>
            ) : null}
          </div>
        )}
      </main>
    </div>
  )
}
