import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { aiService } from '../services/ai'
import { BookOpen, Brain, HelpCircle, FileText } from 'lucide-react'
import Layout from '../components/Layout'

function FlipCard({ front, back }: { front: string; back: string }) {
  const [flipped, setFlipped] = useState(false)
  return (
    <div className="max-w-lg mx-auto">
      <div
        className="cursor-pointer"
        onClick={() => setFlipped((f) => !f)}
        style={{ perspective: '1000px' }}
      >
        <div
          className="relative w-full min-h-[200px] transition-transform duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front face */}
          <div
            className="absolute inset-0 p-6 rounded-xl border-2 border-[#7C3AED]/30 bg-white shadow-sm flex flex-col justify-center"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <p className="text-xs text-[#7C3AED] font-medium mb-2 uppercase tracking-wide">Question</p>
            <p className="font-medium text-slate-900 text-lg">{front}</p>
            <p className="text-xs text-slate-400 mt-4">Click to reveal answer</p>
          </div>
          {/* Back face */}
          <div
            className="absolute inset-0 p-6 rounded-xl border-2 border-emerald-300 bg-emerald-50 shadow-sm flex flex-col justify-center"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <p className="text-xs text-emerald-700 font-medium mb-2 uppercase tracking-wide">Answer</p>
            <p className="text-slate-700 text-lg">{back}</p>
            <p className="text-xs text-slate-400 mt-4">Click to see question</p>
          </div>
        </div>
      </div>
      <div className="flex justify-center mt-4">
        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          className="px-4 py-2 text-sm font-medium rounded-lg border border-[#7C3AED] text-[#7C3AED] hover:bg-[#7C3AED] hover:text-white transition-colors"
        >
          Flip
        </button>
      </div>
    </div>
  )
}

function GridFlashcard({ front, back }: { front: string; back: string }) {
  return (
    <div className="border border-slate-200 rounded-lg p-4">
      <p className="font-medium text-slate-900">{front}</p>
      <p className="text-slate-600 text-sm mt-2">{back}</p>
    </div>
  )
}

export default function LessonPackageView() {
  const { lessonId } = useParams<{ lessonId: string }>()
  const id = Number(lessonId)
  const queryClient = useQueryClient()
  const [currentCard, setCurrentCard] = useState(0)
  const [showAllCards, setShowAllCards] = useState(false)

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

  const isNotFound = error && (error as any)?.response?.status === 404

  if (error && !isNotFound) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-600 mb-4">Something went wrong while loading the lesson package.</p>
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

  if (!pkg || isNotFound) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-slate-600 mb-4">No lesson package generated yet.</p>
            <button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              aria-label="Generate lesson package for this lesson"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#7C3AED] text-white rounded-lg font-semibold disabled:opacity-70"
            >
              {generateMutation.isPending && (
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              )}
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
            <ol className="space-y-2 list-decimal list-inside marker:text-[#7C3AED] marker:font-bold">{pkg.key_notes.map((note, i) => <li key={i} className="text-slate-700">{note}</li>)}</ol>
          </section>
        )}
        {pkg.flashcards && (
          <section className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2"><Brain className="w-5 h-5 text-[#7C3AED]" /><h2 className="font-semibold text-slate-900">Flashcards</h2></div>
              <button
                type="button"
                onClick={() => setShowAllCards((v) => !v)}
                className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                {showAllCards ? 'Single Card' : 'Show All'}
              </button>
            </div>
            {showAllCards ? (
              <div className="grid gap-3">{pkg.flashcards.map((fc, i) => (
                <GridFlashcard key={i} front={fc.front} back={fc.back} />
              ))}</div>
            ) : (
              <div>
                <p className="text-center text-sm text-slate-500 mb-4">Card {currentCard + 1} of {pkg.flashcards.length}</p>
                <FlipCard front={pkg.flashcards[currentCard].front} back={pkg.flashcards[currentCard].back} />
                <div className="flex items-center justify-center gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setCurrentCard((i) => Math.max(0, i - 1))}
                    disabled={currentCard === 0}
                    className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentCard((i) => Math.min(pkg.flashcards.length - 1, i + 1))}
                    disabled={currentCard === pkg.flashcards.length - 1}
                    className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
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
