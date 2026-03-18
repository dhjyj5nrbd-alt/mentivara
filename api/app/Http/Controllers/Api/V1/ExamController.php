<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ExamAnswer;
use App\Models\ExamSession;
use App\Models\KnowledgeMapEntry;
use App\Models\Question;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExamController extends Controller
{
    /**
     * List available questions (filterable).
     */
    public function questions(Request $request): JsonResponse
    {
        $query = Question::with(['subject', 'level', 'topic']);

        if ($request->has('subject_id')) $query->where('subject_id', $request->subject_id);
        if ($request->has('level_id')) $query->where('level_id', $request->level_id);
        if ($request->has('topic_id')) $query->where('topic_id', $request->topic_id);
        if ($request->has('difficulty')) $query->where('difficulty', $request->difficulty);
        if ($request->has('type')) $query->where('type', $request->type);

        return response()->json($query->paginate($request->integer('per_page', 20)));
    }

    /**
     * Start an exam session.
     */
    public function startExam(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'subject_id' => ['required', 'exists:subjects,id'],
            'level_id' => ['required', 'exists:levels,id'],
            'title' => ['required', 'string', 'max:200'],
            'question_count' => ['integer', 'min:5', 'max:50'],
            'difficulty' => ['nullable', 'in:easy,medium,hard'],
            'time_limit_minutes' => ['nullable', 'integer', 'min:5', 'max:180'],
        ]);

        $count = $validated['question_count'] ?? 10;

        $query = Question::where('subject_id', $validated['subject_id'])
            ->where('level_id', $validated['level_id']);

        if (!empty($validated['difficulty'])) {
            $query->where('difficulty', $validated['difficulty']);
        }

        $questions = $query->inRandomOrder()->limit($count)->get();

        if ($questions->count() < 3) {
            return response()->json(['message' => 'Not enough questions available for this selection.'], 422);
        }

        $session = ExamSession::create([
            'student_id' => $request->user()->id,
            'subject_id' => $validated['subject_id'],
            'level_id' => $validated['level_id'],
            'title' => $validated['title'],
            'time_limit_minutes' => $validated['time_limit_minutes'] ?? null,
            'started_at' => now(),
        ]);

        // Pre-create answer slots
        foreach ($questions as $q) {
            ExamAnswer::create([
                'exam_session_id' => $session->id,
                'question_id' => $q->id,
            ]);
        }

        return response()->json([
            'data' => [
                'session' => $session,
                'questions' => $questions->map(fn ($q) => [
                    'id' => $q->id,
                    'type' => $q->type,
                    'content' => $q->content,
                    'options' => $q->options,
                    'difficulty' => $q->difficulty,
                ]),
            ],
        ], 201);
    }

    /**
     * Submit an answer for a question in an exam session.
     */
    public function submitAnswer(Request $request, int $sessionId): JsonResponse
    {
        $validated = $request->validate([
            'question_id' => ['required', 'exists:questions,id'],
            'answer' => ['required', 'string'],
        ]);

        $session = ExamSession::where('id', $sessionId)
            ->where('student_id', $request->user()->id)
            ->whereNull('completed_at')
            ->firstOrFail();

        $question = Question::findOrFail($validated['question_id']);

        $isCorrect = strtolower(trim($validated['answer'])) === strtolower(trim($question->correct_answer));

        ExamAnswer::where('exam_session_id', $session->id)
            ->where('question_id', $validated['question_id'])
            ->update([
                'student_answer' => $validated['answer'],
                'is_correct' => $isCorrect,
            ]);

        return response()->json([
            'data' => [
                'is_correct' => $isCorrect,
                'correct_answer' => $question->correct_answer,
                'explanation' => $question->explanation,
            ],
        ]);
    }

    /**
     * Complete an exam session and calculate score.
     */
    public function completeExam(Request $request, int $sessionId): JsonResponse
    {
        $session = ExamSession::where('id', $sessionId)
            ->where('student_id', $request->user()->id)
            ->whereNull('completed_at')
            ->with('answers.question')
            ->firstOrFail();

        $total = $session->answers->count();
        $correct = $session->answers->where('is_correct', true)->count();
        $score = $total > 0 ? round(($correct / $total) * 100) : 0;

        $gradeBoundaries = [90 => 'A*', 80 => 'A', 70 => 'B', 60 => 'C', 50 => 'D', 40 => 'E', 0 => 'U'];
        $grade = 'U';
        foreach ($gradeBoundaries as $boundary => $g) {
            if ($score >= $boundary) { $grade = $g; break; }
        }

        $session->update([
            'completed_at' => now(),
            'score' => $score,
            'grade_prediction' => $grade,
        ]);

        // Update knowledge map per topic
        $this->updateKnowledgeMap($request->user()->id, $session);

        return response()->json([
            'data' => [
                'score' => $score,
                'correct' => $correct,
                'total' => $total,
                'grade_prediction' => $grade,
                'session' => $session,
            ],
        ]);
    }

    /**
     * View exam history.
     */
    public function history(Request $request): JsonResponse
    {
        $sessions = ExamSession::where('student_id', $request->user()->id)
            ->with(['subject', 'level'])
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($sessions);
    }

    /**
     * View a completed exam with answers.
     */
    public function review(Request $request, int $sessionId): JsonResponse
    {
        $session = ExamSession::where('id', $sessionId)
            ->where('student_id', $request->user()->id)
            ->with(['answers.question', 'subject', 'level'])
            ->firstOrFail();

        return response()->json(['data' => $session]);
    }

    private function updateKnowledgeMap(int $studentId, ExamSession $session): void
    {
        $topicStats = [];

        foreach ($session->answers as $answer) {
            $topicId = $answer->question->topic_id;
            if (!$topicId) continue;

            if (!isset($topicStats[$topicId])) {
                $topicStats[$topicId] = ['attempted' => 0, 'correct' => 0];
            }
            $topicStats[$topicId]['attempted']++;
            if ($answer->is_correct) $topicStats[$topicId]['correct']++;
        }

        foreach ($topicStats as $topicId => $stats) {
            $entry = KnowledgeMapEntry::firstOrCreate(
                ['student_id' => $studentId, 'topic_id' => $topicId],
                ['mastery_pct' => 0, 'questions_attempted' => 0, 'questions_correct' => 0]
            );

            $newAttempted = $entry->questions_attempted + $stats['attempted'];
            $newCorrect = $entry->questions_correct + $stats['correct'];
            $mastery = $newAttempted > 0 ? round(($newCorrect / $newAttempted) * 100) : 0;

            $entry->update([
                'questions_attempted' => $newAttempted,
                'questions_correct' => $newCorrect,
                'mastery_pct' => $mastery,
                'last_assessed_at' => now(),
            ]);
        }
    }
}
