import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { aiService, type DoubtItem } from '../services/ai'
import { tutorService, type RefData } from '../services/tutors'
import { Send, MessageCircle, AlertCircle, Loader2 } from 'lucide-react'
import Layout from '../components/Layout'

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export default function DoubtSolver() {
  const [question, setQuestion] = useState('')
  const [subjectId, setSubjectId] = useState<number | undefined>()
  const queryClient = useQueryClient()

  const { data: subjects } = useQuery({ queryKey: ['subjects'], queryFn: tutorService.getSubjects })
  const { data: doubtsData, isLoading, isError, refetch } = useQuery({ queryKey: ['doubts'], queryFn: aiService.listDoubts })

  const askMutation = useMutation({
    mutationFn: () => aiService.askDoubt(question, subjectId),
    onSuccess: () => { setQuestion(''); queryClient.invalidateQueries({ queryKey: ['doubts'] }) },
  })

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-[#1E1B4B] dark:text-white mb-6">AI Doubt Solver</h1>

        {/* Ask form */}
        <div className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] p-6 mb-6">
          <div className="flex gap-3 mb-3">
            <label htmlFor="doubt-subject-select" className="sr-only">Subject</label>
            <select id="doubt-subject-select" value={subjectId ?? ''} onChange={(e) => setSubjectId(e.target.value ? Number(e.target.value) : undefined)}
              className="px-3 py-2 border border-slate-300 dark:border-[#2d3048] rounded-lg text-sm bg-white dark:bg-[#252839] dark:text-white">
              <option value="">Any Subject</option>
              {subjects?.map((s: RefData) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <label htmlFor="doubt-question-input" className="sr-only">Your question</label>
            <input id="doubt-question-input" value={question} onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && question.trim() && !askMutation.isPending && askMutation.mutate()}
              placeholder="Ask any question..." className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-[#2d3048] rounded-lg bg-white dark:bg-[#252839] dark:text-white dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]" />
            <button onClick={() => askMutation.mutate()} disabled={!question.trim() || askMutation.isPending}
              aria-label={askMutation.isPending ? 'Sending question' : 'Send question'}
              className="px-4 py-2.5 bg-[#7C3AED] text-white rounded-lg disabled:opacity-50 flex items-center gap-2">
              {askMutation.isPending
                ? <><Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Sending...</span></>
                : <Send className="w-5 h-5" />}
            </button>
          </div>
          {askMutation.isPending && <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">AI is thinking...</p>}
          {askMutation.isError && (
            <div className="flex items-start gap-3 p-3 mt-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg border border-rose-200 dark:border-rose-800">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-rose-700 dark:text-rose-300 text-sm">Failed to send your question. Please try again.</p>
            </div>
          )}
        </div>

        {/* Doubts list */}
        {isLoading ? (
          <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7C3AED]" /></div>
        ) : isError ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center p-8 bg-rose-50 dark:bg-rose-900/20 rounded-2xl max-w-md">
              <div className="w-12 h-12 bg-rose-100 dark:bg-rose-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-rose-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Something went wrong</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">Failed to load your questions. Please try again.</p>
              <button onClick={() => refetch()} className="px-4 py-2 bg-[#7C3AED] text-white rounded-lg hover:bg-[#6D28D9] transition-colors">
                Try again
              </button>
            </div>
          </div>
        ) : !doubtsData?.data?.length ? (
          <div className="text-center py-12 bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536]">
            <MessageCircle className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">No questions yet. Ask your first question above!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {doubtsData.data.map((doubt: DoubtItem) => (
              <div key={doubt.id} className="bg-white dark:bg-[#1a1d2e] rounded-xl border border-slate-200 dark:border-[#232536] p-6">
                <div className="flex items-start gap-3 mb-3">
                  <MessageCircle className="w-5 h-5 text-[#7C3AED] mt-0.5 shrink-0" />
                  <p className="font-medium text-slate-900 dark:text-white">{doubt.question_text}</p>
                </div>
                {doubt.ai_answer && (
                  <div className="ml-8 p-4 bg-[#EDE9FE] rounded-lg mb-3">
                    <p className="text-xs font-medium text-[#7C3AED] mb-1">AI Answer</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{doubt.ai_answer}</p>
                  </div>
                )}
                {doubt.tutor_answer && (
                  <div className="ml-8 p-4 bg-emerald-50 rounded-lg">
                    <p className="text-xs font-medium text-emerald-700 mb-1">Tutor Answer — {doubt.tutor?.name}</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{doubt.tutor_answer}</p>
                  </div>
                )}
                <div className="ml-8 mt-2 flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    doubt.status === 'ai_answered' ? 'bg-blue-50 text-blue-600' :
                    doubt.status === 'tutor_answered' ? 'bg-emerald-50 text-emerald-600' :
                    doubt.status === 'escalated' ? 'bg-amber-50 text-amber-600' :
                    'bg-slate-100 text-slate-500'
                  }`}>{capitalizeFirst(doubt.status.replace(/_/g, ' '))}</span>
                  <span className="text-xs text-slate-400">{new Date(doubt.created_at).toLocaleDateString('en-GB')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
