<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AiCoachRecommendation;
use App\Models\ExamSession;
use App\Models\KnowledgeMapEntry;
use App\Models\Lesson;
use App\Models\Streak;
use App\Models\XpLog;
use App\Services\AiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudyCoachController extends Controller
{
    public function __construct(private AiService $ai) {}

    /**
     * Get AI coach recommendations for the student.
     */
    public function recommendations(Request $request): JsonResponse
    {
        $recommendations = AiCoachRecommendation::where('user_id', $request->user()->id)
            ->where('dismissed', false)
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        return response()->json(['data' => $recommendations]);
    }

    /**
     * Generate fresh recommendations based on student performance.
     */
    public function generate(Request $request): JsonResponse
    {
        $user = $request->user();

        // Gather student data
        $weakTopics = KnowledgeMapEntry::where('student_id', $user->id)
            ->where('mastery_pct', '<', 60)
            ->with('topic.subject')
            ->orderBy('mastery_pct')
            ->limit(5)
            ->get();

        $recentExams = ExamSession::where('student_id', $user->id)
            ->whereNotNull('completed_at')
            ->orderByDesc('completed_at')
            ->limit(5)
            ->get();

        $streak = Streak::where('user_id', $user->id)->first();
        $totalXp = XpLog::where('user_id', $user->id)->sum('amount');

        $lessonCount = Lesson::where('student_id', $user->id)
            ->where('status', 'completed')
            ->count();

        // Build context
        $context = "Student stats:\n";
        $context .= "- Total XP: {$totalXp}\n";
        $context .= "- Current streak: " . ($streak?->current_streak ?? 0) . " days\n";
        $context .= "- Completed lessons: {$lessonCount}\n";
        $context .= "- Recent exam scores: " . $recentExams->pluck('score')->implode(', ') . "\n";

        if ($weakTopics->isNotEmpty()) {
            $context .= "- Weak topics: " . $weakTopics->map(fn ($e) => "{$e->topic->name} ({$e->mastery_pct}%)")->implode(', ') . "\n";
        }

        $result = $this->ai->generateJson(
            "You are an AI study coach for a UK student. Based on their performance data, provide 3 personalized recommendations.",
            "{$context}\n\nGenerate a JSON array of 3 objects, each with:\n- type: one of 'focus_area', 'study_strategy', 'pattern_insight', 'encouragement'\n- content: the recommendation text (2-3 sentences, encouraging and actionable)"
        );

        $recommendations = [];
        if ($result && is_array($result)) {
            foreach ($result as $rec) {
                $recommendations[] = AiCoachRecommendation::create([
                    'user_id' => $user->id,
                    'type' => $rec['type'] ?? 'study_strategy',
                    'content' => $rec['content'] ?? '',
                    'data' => [
                        'weak_topics' => $weakTopics->pluck('topic.name')->toArray(),
                        'streak' => $streak?->current_streak ?? 0,
                        'total_xp' => $totalXp,
                    ],
                ]);
            }
        }

        return response()->json(['data' => $recommendations], 201);
    }

    /**
     * Dismiss a recommendation.
     */
    public function dismiss(Request $request, int $id): JsonResponse
    {
        AiCoachRecommendation::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->update(['dismissed' => true]);

        return response()->json(['message' => 'Dismissed.']);
    }

    /**
     * Get overall study stats summary.
     */
    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();

        $totalXp = XpLog::where('user_id', $user->id)->sum('amount');
        $streak = Streak::where('user_id', $user->id)->first();
        $lessonsCompleted = Lesson::where('student_id', $user->id)->where('status', 'completed')->count();
        $examsCompleted = ExamSession::where('student_id', $user->id)->whereNotNull('completed_at')->count();
        $avgExamScore = ExamSession::where('student_id', $user->id)->whereNotNull('score')->avg('score');
        $topicsStudied = KnowledgeMapEntry::where('student_id', $user->id)->count();
        $topicsMastered = KnowledgeMapEntry::where('student_id', $user->id)->where('mastery_pct', '>=', 80)->count();

        return response()->json([
            'data' => [
                'total_xp' => (int) $totalXp,
                'current_streak' => $streak?->current_streak ?? 0,
                'longest_streak' => $streak?->longest_streak ?? 0,
                'lessons_completed' => $lessonsCompleted,
                'exams_completed' => $examsCompleted,
                'avg_exam_score' => $avgExamScore ? round($avgExamScore) : null,
                'topics_studied' => $topicsStudied,
                'topics_mastered' => $topicsMastered,
            ],
        ]);
    }
}
