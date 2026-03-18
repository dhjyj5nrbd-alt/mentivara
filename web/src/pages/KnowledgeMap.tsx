import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { aiService, type KnowledgeEntry } from '../services/ai'

function MasteryBar({ pct }: { pct: number }) {
  const color = pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-3 w-full">
      <div className="flex-1 bg-slate-200 rounded-full h-3">
        <div className={`h-3 rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-sm font-semibold w-12 text-right ${pct >= 80 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
        {pct}%
      </span>
    </div>
  )
}

export default function KnowledgeMap() {
  const { data: knowledgeMap, isLoading } = useQuery({
    queryKey: ['knowledge-map'],
    queryFn: aiService.getKnowledgeMap,
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between h-16">
          <Link to="/dashboard" className="text-xl font-bold text-[#1E1B4B]">Mentivara</Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-[#1E1B4B] mb-2">Knowledge Map</h1>
        <p className="text-slate-600 mb-6">Track your mastery across topics. Complete exams to update your map.</p>

        {isLoading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7C3AED]" /></div>
        ) : !knowledgeMap || Object.keys(knowledgeMap).length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <p className="text-slate-500 mb-4">No data yet. Complete an exam to start building your knowledge map.</p>
            <Link to="/exam" className="text-[#7C3AED] hover:underline font-medium">Take an Exam</Link>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(knowledgeMap).map(([subject, entries]) => (
              <div key={subject} className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="font-semibold text-slate-900 mb-4">{subject}</h2>
                <div className="space-y-3">
                  {(entries as KnowledgeEntry[]).map((entry) => (
                    <div key={entry.topic_id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-slate-700">{entry.topic_name}</span>
                        <span className="text-xs text-slate-400">{entry.questions_correct}/{entry.questions_attempted} correct</span>
                      </div>
                      <MasteryBar pct={entry.mastery_pct} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
