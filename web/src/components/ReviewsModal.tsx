import { Star, X, ThumbsUp } from 'lucide-react'

export interface Review {
  id: number
  name: string
  rating: number
  date: string
  text: string
  subject: string
}

export const TUTOR_REVIEWS: Record<number, Review[]> = {
  1: [
    { id: 1, name: 'Sophie T.', rating: 5, date: '2 weeks ago', text: 'Dr Mitchell is incredible! She explained quadratics in a way that finally made sense. My grade went from a C to an A in just 3 months.', subject: 'Mathematics' },
    { id: 2, name: 'Oliver K.', rating: 5, date: '1 month ago', text: 'Very patient and always well-prepared. She uses great visual examples that really help concepts stick.', subject: 'Mathematics' },
    { id: 3, name: 'Amara J.', rating: 4, date: '1 month ago', text: 'Great tutor who genuinely cares about her students. Lessons are well-structured and she always provides extra practice materials.', subject: 'Mathematics' },
    { id: 4, name: 'James L.', rating: 5, date: '2 months ago', text: 'Helped me prepare for my A-Level exam. Her tips on time management during exams were invaluable.', subject: 'Mathematics' },
    { id: 5, name: 'Priya S.', rating: 5, date: '3 months ago', text: 'My daughter loves her lessons! She makes maths fun and engaging which I never thought was possible.', subject: 'Mathematics' },
  ],
  2: [
    { id: 1, name: 'Emily R.', rating: 5, date: '1 week ago', text: 'Mr Chen makes biology fascinating. His PhD background means he can answer even the most detailed questions about cellular processes.', subject: 'Biology' },
    { id: 2, name: 'Hassan M.', rating: 5, date: '3 weeks ago', text: 'Brilliant tutor who goes above and beyond. He sent me extra resources after each lesson and always followed up.', subject: 'Chemistry' },
    { id: 3, name: 'Lucy W.', rating: 4, date: '1 month ago', text: 'Very knowledgeable and patient. Sometimes lessons run a bit over time because he wants to make sure you understand everything.', subject: 'Biology' },
  ],
  3: [
    { id: 1, name: 'Daniel P.', rating: 5, date: '1 week ago', text: 'Miss Richardson transformed my essay writing. The PEEL method she teaches is so effective — my teacher noticed the improvement immediately.', subject: 'English' },
    { id: 2, name: 'Zara A.', rating: 5, date: '2 weeks ago', text: 'As a published author herself, she brings real insight into literary analysis. She helped me see texts in a completely new way.', subject: 'English' },
    { id: 3, name: 'Tom H.', rating: 4, date: '1 month ago', text: 'Patient and encouraging. She gave me confidence in my writing which I was really struggling with before.', subject: 'English' },
    { id: 4, name: 'Mia C.', rating: 5, date: '2 months ago', text: 'Best English tutor I have ever had. She makes you think critically and her feedback on essays is incredibly detailed.', subject: 'English' },
  ],
  4: [
    { id: 1, name: 'Alex B.', rating: 5, date: '2 weeks ago', text: 'Dr Patel explains physics concepts using real-world examples that make everything click. Highly recommend for A-Level physics.', subject: 'Physics' },
    { id: 2, name: 'Grace F.', rating: 5, date: '1 month ago', text: 'He helped me understand mechanics which I was completely lost on. Very calm and patient teaching style.', subject: 'Physics' },
    { id: 3, name: 'Ryan D.', rating: 4, date: '2 months ago', text: 'Good tutor with a strong research background. Makes complex topics accessible and always has great problem sets prepared.', subject: 'Physics' },
  ],
}

interface ReviewsModalProps {
  tutorId: number
  rating: number
  totalReviews: number
  onClose: () => void
}

export default function ReviewsModal({ tutorId, rating, totalReviews, onClose }: ReviewsModalProps) {
  const reviews = TUTOR_REVIEWS[tutorId] || []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white dark:bg-[#161822] rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-[#232536]">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Reviews</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${s <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-600'}`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-slate-800 dark:text-white">{rating}</span>
              <span className="text-sm text-slate-400">· {totalReviews} reviews</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#252839] flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#2d3048] transition-colors"
            aria-label="Close reviews"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Reviews list */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4">
          {reviews.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No reviews yet.</p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="pb-4 border-b border-slate-100 dark:border-[#232536] last:border-0">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#EDE9FE] dark:bg-[#7C3AED]/20 flex items-center justify-center text-[#7C3AED] font-semibold text-xs">
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{review.name}</p>
                      <p className="text-[10px] text-slate-400">{review.date} · {review.subject}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3 h-3 ${s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-600'}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{review.text}</p>
                <button className="flex items-center gap-1 mt-1.5 text-[10px] text-slate-400 hover:text-[#7C3AED] transition-colors">
                  <ThumbsUp className="w-3 h-3" /> Helpful
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
