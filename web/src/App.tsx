import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from './store/authStore'
import { useThemeStore } from './store/themeStore'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import TutorDirectory from './pages/TutorDirectory'
import TutorView from './pages/TutorView'
import Lessons from './pages/Lessons'
import BookLesson from './pages/BookLesson'
import Classroom from './pages/Classroom'
import Payments from './pages/Payments'
import LessonPackageView from './pages/LessonPackageView'
import DoubtSolver from './pages/DoubtSolver'
import ExamSimulator from './pages/ExamSimulator'
import KnowledgeMap from './pages/KnowledgeMap'
import MentalDojo from './pages/MentalDojo'
import Curriculum from './pages/Curriculum'
import Messages from './pages/Messages'
import TutorReels from './pages/TutorReels'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import PendingTutors from './pages/admin/PendingTutors'
import StudyMissions from './pages/StudyMissions'
import Forum from './pages/Forum'
import StudyGroups from './pages/StudyGroups'
import AdminPayments from './pages/admin/AdminPayments'
import Competitions from './pages/Competitions'
import StudyCoach from './pages/StudyCoach'
import StudyOptimizer from './pages/StudyOptimizer'
import ParentDashboard from './pages/ParentDashboard'

const queryClient = new QueryClient()

function AppRoutes() {
  const { loadUser, isAuthenticated, isLoading } = useAuthStore()
  const theme = useThemeStore((s) => s.theme)

  useEffect(() => { loadUser() }, [loadUser])

  // Sync theme to <html> element
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0f1117]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7C3AED]" /></div>
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} />
      <Route path="/tutors" element={<TutorDirectory />} />
      <Route path="/tutors/:id" element={<TutorView />} />
      <Route path="/tutors/:id/book" element={<ProtectedRoute roles={['student']}><BookLesson /></ProtectedRoute>} />
      <Route path="/lessons" element={<ProtectedRoute><Lessons /></ProtectedRoute>} />
      <Route path="/classroom/:lessonId" element={<ProtectedRoute><Classroom /></ProtectedRoute>} />
      <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
      <Route path="/lessons/:lessonId/package" element={<ProtectedRoute><LessonPackageView /></ProtectedRoute>} />
      <Route path="/doubts" element={<ProtectedRoute roles={['student']}><DoubtSolver /></ProtectedRoute>} />
      <Route path="/curriculum" element={<ProtectedRoute roles={['student']}><Curriculum /></ProtectedRoute>} />
      <Route path="/exam" element={<ProtectedRoute roles={['student']}><ExamSimulator /></ProtectedRoute>} />
      <Route path="/knowledge-map" element={<ProtectedRoute roles={['student']}><KnowledgeMap /></ProtectedRoute>} />
      <Route path="/reels" element={<ProtectedRoute roles={['student']}><TutorReels /></ProtectedRoute>} />
      <Route path="/missions" element={<ProtectedRoute roles={['student']}><StudyMissions /></ProtectedRoute>} />
      <Route path="/mental-dojo" element={<ProtectedRoute roles={['student']}><MentalDojo /></ProtectedRoute>} />
      <Route path="/forum" element={<ProtectedRoute roles={['student']}><Forum /></ProtectedRoute>} />
      <Route path="/forum/category/:categoryId" element={<ProtectedRoute roles={['student']}><Forum /></ProtectedRoute>} />
      <Route path="/forum/thread/:threadId" element={<ProtectedRoute roles={['student']}><Forum /></ProtectedRoute>} />
      <Route path="/study-groups" element={<ProtectedRoute roles={['student']}><StudyGroups /></ProtectedRoute>} />
      <Route path="/study-groups/:groupId" element={<ProtectedRoute roles={['student']}><StudyGroups /></ProtectedRoute>} />
      <Route path="/competitions" element={<ProtectedRoute roles={['student']}><Competitions /></ProtectedRoute>} />
      <Route path="/study-coach" element={<ProtectedRoute roles={['student']}><StudyCoach /></ProtectedRoute>} />
      <Route path="/study-optimizer" element={<ProtectedRoute roles={['student']}><StudyOptimizer /></ProtectedRoute>} />
      <Route path="/messages/conversations" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
      <Route path="/parent-dashboard" element={<ProtectedRoute roles={['parent']}><ParentDashboard /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/tutors-pending" element={<ProtectedRoute roles={['admin']}><PendingTutors /></ProtectedRoute>} />
      <Route path="/admin/payments" element={<ProtectedRoute roles={['admin']}><AdminPayments /></ProtectedRoute>} />
    </Routes>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
