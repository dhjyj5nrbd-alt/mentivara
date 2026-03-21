import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { aiService } from '../services/ai'
import { BookOpen, Brain, HelpCircle, FileText } from 'lucide-react'
import Layout from '../components/Layout'

function Flashcard({ front, back }: { front: string; back: string }) {
  const [flipped, setFlipped] = useState(false)
  return (
    <button
      type="button"
      onClick={() => setFlipped((f) => !f)}
      className="w-full text-left border border-slate-200 rounded-lg p-4 hover:border-[#7C3AED] transition-colors cursor-pointer"
    >
      {flipped ? (
        <>
          <p className="text-xs text-[#7C3AED] font-medium mb-1">Answer</p>
          <p className="text-slate-600 text-sm">{back}</p>
        </>
      ) : (
        <p className="font-medium text-slate-900">{front}</p>
      )}
      <p className="text-xs text-slate-400 mt-2">{flipped ? 'Click to see question' : 'Click to reveal answer'}</p>
    </button>
  )
}

export default function LessonPackageView() {
  const { lessonId } = useParams<{ lessonId: string }>()
  const id = Number(lessonId)
  const queryClient = useQueryClient()

  const { data: pkg, isLoading, error } = useQuery({
    queryKey: ['lesson-package', id],
    queryFn: () => aiService.getPackage(id),
    retry: false,
  })

  const generateMutation = useMutation({
    mutationFn: () => aiService.generatePackage(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lesson-package', id] }),
  })

  if (isLoading) {
    return <Layout><div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7C3AED]" /></div></Layout>
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-600 mb-4">Failed to load lesson package.</p>
            <button
              onClick={() => queryClient.invalidateQueries({ queryKey: ['lesson-package', id] })}
              className="text-[#7C3AED] hover:underline font-medium"
            >
              Retry
            </button>
            <div className="mt-4"><Link to="/lessons" className="text-sm text-slate-500">Back to lessons</Link></div>
          </div>
        </div>
      </Layout>
    )
  }

  if (!pkg) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-slate-600 mb-4">No lesson package generated yet.</p>
            <button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="px-6 py-3 bg-[#7C3AED] text-white rounded-lg font-semibold"
            >
              {generateMutation.isPending ? 'Generating...' : 'Generate Lesson Package'}
            </button>
            <div className="mt-4"><Link to="/lessons" className="text-sm text-slate-500">Back to lessons</Link></div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#1E1B4B]">Lesson Package</h1>
          <Link to="/lessons" className="text-sm text-slate-500">Back</Link>
        </div>
        {pkg.summary && (
          <section className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-3"><FileText className="w-5 h-5 text-[#7C3AED]" /><h2 className="font-semibold text-slate-900">Summary</h2></div>
            <p className="text-slate-700">{pkg.summary}</p>
          </section>
        )}
        {pkg.key_notes && (
          <section className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-3"><BookOpen className="w-5 h-5 text-[#7C3AED]" /><h2 className="font-semibold text-slate-900">Key Notes</h2></div>
            <ul className="space-y-2">{pkg.key_notes.map((note, i) => <li key={i} className="text-slate-700 flex gap-2"><span className="text-[#7C3AED] font-bold">{i+1}.</span>{note}</li>)}</ul>
          </section>
        )}
        {pkg.flashcards && (
          <section className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-3"><Brain className="w-5 h-5 text-[#7C3AED]" /><h2 className="font-semibold text-slate-900">Flashcards</h2></div>
            <div className="grid gap-3">{pkg.flashcards.map((fc, i) => (
              <Flashcard key={i} front={fc.front} back={fc.back} />
            ))}</div>
          </section>
        )}
        {pkg.practice_questions && (
          <section className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-3"><HelpCircle className="w-5 h-5 text-[#7C3AED]" /><h2 className="font-semibold text-slate-900">Practice Questions</h2></div>
            <div className="space-y-3">{pkg.practice_questions.map((pq, i) => (
              <div key={i} className="border border-slate-200 rounded-lg p-4">
                <p className="font-medium text-slate-900">{pq.question}</p>
                {pq.hint && <p className="text-slate-500 text-sm mt-1">Hint: {pq.hint}</p>}
              </div>
            ))}</div>
          </section>
        )}
        {pkg.homework && (
          <section className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-3"><FileText className="w-5 h-5 text-amber-500" /><h2 className="font-semibold text-slate-900">Homework</h2></div>
            <p className="text-slate-700">{pkg.homework}</p>
          </section>
        )}
      </div>
    </Layout>
  )
}
