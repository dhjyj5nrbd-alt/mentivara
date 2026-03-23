import { useState } from 'react'
import Layout from '../../components/Layout'
import {
  Search, ChevronDown, ChevronUp, Mail, UserX, UserCheck, Trash2,
  MoreHorizontal, Eye, X,
} from 'lucide-react'

// ── Demo Data ──────────────────────────────────────────────
interface DemoUser {
  id: number
  name: string
  email: string
  role: 'student' | 'tutor' | 'parent' | 'admin'
  status: 'active' | 'suspended' | 'pending'
  joinedDate: string
  lastActive: string
  avatar: string
  lessonsCount: number
  totalSpent: number
}

const DEMO_USERS: DemoUser[] = [
  { id: 1, name: 'Alex Johnson', email: 'alex@demo.mentivara.com', role: 'student', status: 'active', joinedDate: '2025-09-15', lastActive: '2 hours ago', avatar: 'AJ', lessonsCount: 48, totalSpent: 2400 },
  { id: 2, name: 'Emma Williams', email: 'emma.w@example.com', role: 'student', status: 'active', joinedDate: '2025-10-02', lastActive: '30 mins ago', avatar: 'EW', lessonsCount: 32, totalSpent: 1600 },
  { id: 3, name: 'Oliver Brown', email: 'oliver.b@example.com', role: 'student', status: 'active', joinedDate: '2025-11-18', lastActive: '1 day ago', avatar: 'OB', lessonsCount: 15, totalSpent: 750 },
  { id: 4, name: 'Sophia Davis', email: 'sophia.d@example.com', role: 'student', status: 'suspended', joinedDate: '2025-08-22', lastActive: '2 weeks ago', avatar: 'SD', lessonsCount: 8, totalSpent: 400 },
  { id: 5, name: 'Liam Wilson', email: 'liam.w@example.com', role: 'student', status: 'active', joinedDate: '2026-01-10', lastActive: '5 hours ago', avatar: 'LW', lessonsCount: 22, totalSpent: 1100 },
  { id: 6, name: 'Mia Patel', email: 'mia.p@example.com', role: 'student', status: 'active', joinedDate: '2026-02-01', lastActive: '3 hours ago', avatar: 'MP', lessonsCount: 12, totalSpent: 600 },
  { id: 7, name: 'Noah Garcia', email: 'noah.g@example.com', role: 'student', status: 'pending', joinedDate: '2026-03-20', lastActive: 'Never', avatar: 'NG', lessonsCount: 0, totalSpent: 0 },
  { id: 10, name: 'Dr Sarah Mitchell', email: 'sarah@mentivara.com', role: 'tutor', status: 'active', joinedDate: '2025-06-01', lastActive: '1 hour ago', avatar: 'SM', lessonsCount: 342, totalSpent: 0 },
  { id: 11, name: 'James Chen', email: 'james@mentivara.com', role: 'tutor', status: 'active', joinedDate: '2025-06-15', lastActive: '45 mins ago', avatar: 'JC', lessonsCount: 287, totalSpent: 0 },
  { id: 12, name: 'Emma Richardson', email: 'emma.r@mentivara.com', role: 'tutor', status: 'active', joinedDate: '2025-07-01', lastActive: '2 hours ago', avatar: 'ER', lessonsCount: 256, totalSpent: 0 },
  { id: 13, name: 'Dr Raj Patel', email: 'raj@mentivara.com', role: 'tutor', status: 'active', joinedDate: '2025-07-20', lastActive: '3 hours ago', avatar: 'RP', lessonsCount: 198, totalSpent: 0 },
  { id: 14, name: 'Lisa Wang', email: 'lisa.w@mentivara.com', role: 'tutor', status: 'suspended', joinedDate: '2025-09-10', lastActive: '1 month ago', avatar: 'LiW', lessonsCount: 45, totalSpent: 0 },
  { id: 15, name: 'Tom Andrews', email: 'tom.a@mentivara.com', role: 'tutor', status: 'pending', joinedDate: '2026-03-18', lastActive: 'Never', avatar: 'TA', lessonsCount: 0, totalSpent: 0 },
  { id: 100, name: 'Sarah Johnson', email: 'sarah.j@example.com', role: 'parent', status: 'active', joinedDate: '2025-09-15', lastActive: '4 hours ago', avatar: 'SJ', lessonsCount: 0, totalSpent: 2400 },
  { id: 101, name: 'Michael Brown', email: 'michael.b@example.com', role: 'parent', status: 'active', joinedDate: '2025-11-18', lastActive: '1 day ago', avatar: 'MB', lessonsCount: 0, totalSpent: 750 },
  { id: 102, name: 'Karen Davis', email: 'karen.d@example.com', role: 'parent', status: 'active', joinedDate: '2025-08-22', lastActive: '3 days ago', avatar: 'KD', lessonsCount: 0, totalSpent: 400 },
  { id: 103, name: 'David Wilson', email: 'david.w@example.com', role: 'parent', status: 'suspended', joinedDate: '2025-12-05', lastActive: '2 weeks ago', avatar: 'DW', lessonsCount: 0, totalSpent: 1100 },
  { id: 300, name: 'Admin User', email: 'admin@mentivara.com', role: 'admin', status: 'active', joinedDate: '2025-01-01', lastActive: 'Just now', avatar: 'AU', lessonsCount: 0, totalSpent: 0 },
]

const ROLE_TABS = ['All', 'Student', 'Tutor', 'Parent', 'Admin'] as const

export default function AdminUsers() {
  const [users, setUsers] = useState(DEMO_USERS)
  const [searchInput, setSearchInput] = useState('')
  const [activeTab, setActiveTab] = useState<string>('All')
  const [statusFilter, setStatusFilter] = useState('')
  const [expandedUser, setExpandedUser] = useState<number | null>(null)
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set())
  const [showDeleteModal, setShowDeleteModal] = useState<number | null>(null)
  const [showMessageModal, setShowMessageModal] = useState<number | null>(null)
  const [messageText, setMessageText] = useState('')

  const filteredUsers = users.filter((u) => {
    const matchRole = activeTab === 'All' || u.role === activeTab.toLowerCase()
    const matchStatus = !statusFilter || u.status === statusFilter
    const matchSearch = !searchInput || u.name.toLowerCase().includes(searchInput.toLowerCase()) || u.email.toLowerCase().includes(searchInput.toLowerCase())
    return matchRole && matchStatus && matchSearch
  })

  const toggleSelect = (id: number) => {
    const next = new Set(selectedUsers)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedUsers(next)
  }

  const toggleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set())
    } else {
      setSelectedUsers(new Set(filteredUsers.map((u) => u.id)))
    }
  }

  const toggleStatus = (id: number) => {
    setUsers((prev) => prev.map((u) => {
      if (u.id !== id) return u
      return { ...u, status: u.status === 'active' ? 'suspended' : 'active' as any }
    }))
  }

  const bulkSuspend = () => {
    setUsers((prev) => prev.map((u) =>
      selectedUsers.has(u.id) && u.role !== 'admin' ? { ...u, status: 'suspended' as const } : u
    ))
    setSelectedUsers(new Set())
  }

  const deleteUser = (id: number) => {
    setUsers((prev) => prev.filter((u) => u.id !== id))
    setShowDeleteModal(null)
  }

  const statusBadge = (s: string) => {
    const colors: Record<string, string> = {
      active: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      pending: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      suspended: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    }
    return colors[s] || 'bg-slate-100 text-slate-600'
  }

  const roleBadge = (r: string) => {
    const colors: Record<string, string> = {
      student: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      tutor: 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
      parent: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      admin: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    }
    return colors[r] || 'bg-slate-100 text-slate-600'
  }

  return (
    <Layout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1E1B4B] dark:text-white">Users</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{users.length} total users on the platform</p>
          </div>
        </div>

        {/* Role Tabs */}
        <div className="flex gap-1 mb-4 bg-slate-100 dark:bg-[#252839] p-1 rounded-lg w-fit">
          {ROLE_TABS.map((tab) => {
            const count = tab === 'All' ? users.length : users.filter((u) => u.role === tab.toLowerCase()).length
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  activeTab === tab
                    ? 'bg-white dark:bg-[#1a1d2e] text-[#7C3AED] font-medium shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}
              >
                {tab} <span className="text-xs opacity-60">({count})</span>
              </button>
            )
          })}
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-4 py-2 border border-slate-300 dark:border-[#2d3048] rounded-lg text-sm bg-white dark:bg-[#252839] dark:text-white dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 dark:border-[#2d3048] rounded-lg text-sm bg-white dark:bg-[#252839] dark:text-white"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.size > 0 && (
          <div className="mb-4 bg-[#EDE9FE] dark:bg-[#7C3AED]/20 border border-[#7C3AED]/20 rounded-lg p-3 flex items-center gap-3">
            <span className="text-sm font-medium text-[#7C3AED]">{selectedUsers.size} selected</span>
            <button onClick={bulkSuspend} className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1">
              <UserX className="w-3 h-3" /> Bulk Suspend
            </button>
            <button onClick={() => alert('Bulk email sent (demo)')} className="px-3 py-1.5 text-xs bg-[#7C3AED] text-white rounded-lg hover:bg-[#6D28D9] transition-colors flex items-center gap-1">
              <Mail className="w-3 h-3" /> Bulk Email
            </button>
            <button onClick={() => setSelectedUsers(new Set())} className="ml-auto text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400">
              Clear selection
            </button>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-[#252839] text-left">
              <tr>
                <th className="px-4 py-3 w-8">
                  <input
                    type="checkbox"
                    checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-[#7C3AED] focus:ring-[#7C3AED]"
                  />
                </th>
                <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Name</th>
                <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400 hidden sm:table-cell">Email</th>
                <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Role</th>
                <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Status</th>
                <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400 hidden md:table-cell">Joined</th>
                <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400 hidden lg:table-cell">Last Active</th>
                <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#232536]">
              {filteredUsers.map((user) => (
                <>
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-[#252839] transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user.id)}
                        onChange={() => toggleSelect(user.id)}
                        className="rounded border-slate-300 text-[#7C3AED] focus:ring-[#7C3AED]"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#EDE9FE] dark:bg-[#7C3AED]/20 flex items-center justify-center text-[#7C3AED] text-xs font-semibold shrink-0">
                          {user.avatar}
                        </div>
                        <span className="font-medium text-slate-900 dark:text-white">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 hidden sm:table-cell">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${roleBadge(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusBadge(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 hidden md:table-cell">
                      {new Date(user.joinedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 hidden lg:table-cell">{user.lastActive}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#252839] text-slate-400 hover:text-[#7C3AED] transition-colors"
                          title="View details"
                        >
                          {expandedUser === user.id ? <ChevronUp className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        {user.role !== 'admin' && (
                          <>
                            <button
                              onClick={() => toggleStatus(user.id)}
                              className={`p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#252839] transition-colors ${
                                user.status === 'active' ? 'text-slate-400 hover:text-red-500' : 'text-slate-400 hover:text-emerald-500'
                              }`}
                              title={user.status === 'active' ? 'Suspend' : 'Activate'}
                            >
                              {user.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => { setShowMessageModal(user.id); setMessageText('') }}
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#252839] text-slate-400 hover:text-blue-500 transition-colors"
                              title="Send message"
                            >
                              <Mail className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setShowDeleteModal(user.id)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#252839] text-slate-400 hover:text-red-500 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                  {/* Expanded Details */}
                  {expandedUser === user.id && (
                    <tr key={`${user.id}-detail`}>
                      <td colSpan={8} className="px-4 py-4 bg-slate-50 dark:bg-[#252839]">
                        <div className="grid sm:grid-cols-3 gap-6">
                          <div>
                            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">User Details</h4>
                            <div className="space-y-1.5 text-sm">
                              <p className="text-slate-700 dark:text-slate-300"><span className="text-slate-500 dark:text-slate-400">Name:</span> {user.name}</p>
                              <p className="text-slate-700 dark:text-slate-300"><span className="text-slate-500 dark:text-slate-400">Email:</span> {user.email}</p>
                              <p className="text-slate-700 dark:text-slate-300"><span className="text-slate-500 dark:text-slate-400">Role:</span> <span className="capitalize">{user.role}</span></p>
                              <p className="text-slate-700 dark:text-slate-300"><span className="text-slate-500 dark:text-slate-400">Joined:</span> {new Date(user.joinedDate).toLocaleDateString('en-GB')}</p>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Lesson History</h4>
                            <div className="space-y-1.5 text-sm">
                              <p className="text-slate-700 dark:text-slate-300"><span className="text-slate-500 dark:text-slate-400">Total Lessons:</span> {user.lessonsCount}</p>
                              <p className="text-slate-700 dark:text-slate-300"><span className="text-slate-500 dark:text-slate-400">Last Active:</span> {user.lastActive}</p>
                              {user.role === 'tutor' && (
                                <p className="text-slate-700 dark:text-slate-300"><span className="text-slate-500 dark:text-slate-400">Earnings:</span> £{(user.lessonsCount * 35).toLocaleString()}</p>
                              )}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Payment History</h4>
                            <div className="space-y-1.5 text-sm">
                              {user.role === 'student' || user.role === 'parent' ? (
                                <>
                                  <p className="text-slate-700 dark:text-slate-300"><span className="text-slate-500 dark:text-slate-400">Total Spent:</span> £{user.totalSpent.toLocaleString()}</p>
                                  <p className="text-slate-700 dark:text-slate-300"><span className="text-slate-500 dark:text-slate-400">Avg per lesson:</span> £{user.lessonsCount > 0 ? Math.round(user.totalSpent / user.lessonsCount) : 0}</p>
                                </>
                              ) : user.role === 'tutor' ? (
                                <>
                                  <p className="text-slate-700 dark:text-slate-300"><span className="text-slate-500 dark:text-slate-400">Total Earned:</span> £{(user.lessonsCount * 35).toLocaleString()}</p>
                                  <p className="text-slate-700 dark:text-slate-300"><span className="text-slate-500 dark:text-slate-400">Platform Fee:</span> £{(user.lessonsCount * 15).toLocaleString()}</p>
                                </>
                              ) : (
                                <p className="text-slate-500 dark:text-slate-400">N/A</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 bg-slate-50 dark:bg-[#252839] text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-[#232536]">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Delete User</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Are you sure you want to delete <strong>{users.find((u) => u.id === showDeleteModal)?.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowDeleteModal(null)} className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#252839] rounded-lg transition-colors">
                Cancel
              </button>
              <button onClick={() => deleteUser(showDeleteModal)} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Send Message to {users.find((u) => u.id === showMessageModal)?.name}
              </h3>
              <button onClick={() => setShowMessageModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type your message..."
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 dark:border-[#2d3048] rounded-lg text-sm bg-white dark:bg-[#252839] dark:text-white dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] resize-none"
            />
            <div className="flex gap-3 justify-end mt-4">
              <button onClick={() => setShowMessageModal(null)} className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#252839] rounded-lg transition-colors">
                Cancel
              </button>
              <button
                onClick={() => { alert(`Message sent to ${users.find((u) => u.id === showMessageModal)?.name} (demo)`); setShowMessageModal(null) }}
                className="px-4 py-2 text-sm bg-[#7C3AED] text-white rounded-lg hover:bg-[#6D28D9] transition-colors"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
