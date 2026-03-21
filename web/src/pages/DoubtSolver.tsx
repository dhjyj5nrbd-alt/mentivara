import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { aiService, type DoubtItem } from '../services/ai'
import { tutorService, type RefData } from '../services/tutors'
import { Send, MessageCircle } from 'lucide-react'
import Layout from '../components/Layout'

export default function DoubtSolver() {
  const [question, setQuestion] = useState('')
  const [subjectId, setSubjectId] = useState<number | undefined>()
  const queryClient = useQueryClient()

  const { data: subjects } = useQuery({ queryKey: ['subjects'], queryFn: tutorService.getSubjects })
  const { data: doubtsData, isLoading } = useQuery({ queryKey: ['doubts'], queryFn: aiService.listDoubts })

  const askMutation = useMutation({
    mutationFn: () => aiService.askDoubt(question, subjectId),
    onSuccess: () => { setQuestion(''); queryClient.invalidateQueries({ queryKey: ['doubts'] }) },
  })

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-[#1E1B4B] mb-6">AI Doubt Solver</h1>

        {/* Ask form */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <div className="flex gap-3 mb-3">
            <select value={subjectId ?? ''} onChange={(e) => setSubjectId(e.target.value ? Number(e.target.value) : undefined)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white">
              <option value="">Any Subject</option>
              {subjects?.map((s: RefData) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <label htmlFor="doubt-question-input" className="sr-only">Your question</label>
            <input id="doubt-question-input" value={question} onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && question.trim() && askMutation.mutate()}
              placeholder="Ask any question..." className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED]" />
            <button onClick={() => askMutation.mutate()} disabled={!question.trim() || askMutation.isPending}
              aria-label="Send question"
              className="px-4 py-2.5 bg-[#7C3AED] text-white rounded-lg disabled:opacity-50">
              <Send className="w-5 h-5" />
            </button>
          </div>
          {askMutation.isPending && <p className="text-sm text-slate-500 mt-2">AI is thinking...</p>}
          {askMutation.isError && <p className="text-sm text-red-600 mt-2">Failed to submit your question. Please try again.</p>}
        </div>

        {/* Doubts list */}
        {isLoading ? (
          <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7C3AED]" /></div>
        ) : !doubtsData?.data?.length ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <MessageCircle className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No questions yet. Ask your first question above!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {doubtsData.data.map((doubt: DoubtItem) => (
              <div key={doubt.id} className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-start gap-3 mb-3">
                  <MessageCircle className="w-5 h-5 text-[#7C3AED] mt-0.5 shrink-0" />
                  <p className="font-medium text-slate-900">{doubt.question_text}</p>
                </div>
                {doubt.ai_answer && (
                  <div className="ml-8 p-4 bg-[#EDE9FE] rounded-lg mb-3">
                    <p className="text-xs font-medium text-[#7C3AED] mb-1">AI Answer</p>
                    <p className="text-sm text-slate-700">{doubt.ai_answer}</p>
                  </div>
                )}
                {doubt.tutor_answer && (
                  <div className="ml-8 p-4 bg-emerald-50 rounded-lg">
                    <p className="text-xs font-medium text-emerald-700 mb-1">Tutor Answer — {doubt.tutor?.name}</p>
                    <p className="text-sm text-slate-700">{doubt.tutor_answer}</p>
                  </div>
                )}
                <div className="ml-8 mt-2 flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    doubt.status === 'ai_answered' ? 'bg-blue-50 text-blue-600' :
                    doubt.status === 'tutor_answered' ? 'bg-emerald-50 text-emerald-600' :
                    doubt.status === 'escalated' ? 'bg-amber-50 text-amber-600' :
                    'bg-slate-100 text-slate-500'
                  }`}>{doubt.status.replace(/_/g, ' ')}</span>
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
