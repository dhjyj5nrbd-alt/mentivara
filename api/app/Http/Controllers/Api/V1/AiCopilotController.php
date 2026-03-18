<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Services\AiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiCopilotController extends Controller
{
    public function __construct(private AiService $ai) {}

    /**
     * Tutor-side AI copilot: generate examples, questions, explanations during a lesson.
     */
    public function assist(Request $request, int $lessonId): JsonResponse
    {
        $validated = $request->validate([
            'action' => ['required', 'in:generate_example,generate_questions,explain_concept,suggest_activity'],
            'topic' => ['required', 'string', 'max:500'],
            'context' => ['nullable', 'string', 'max:1000'],
            'level' => ['nullable', 'string'],
        ]);

        $user = $request->user();

        $lesson = Lesson::with('subject')
            ->where('id', $lessonId)
            ->where('tutor_id', $user->id)
            ->firstOrFail();

        $subject = $lesson->subject?->name ?? 'General';
        $level = $validated['level'] ?? 'GCSE';
        $context = $validated['context'] ?? '';

        $prompts = [
            'generate_example' => "Generate a clear, worked example for a {$level} {$subject} student on the topic: {$validated['topic']}. {$context}\n\nProvide a step-by-step worked example that a tutor can walk through with their student.",
            'generate_questions' => "Generate 5 practice questions for a {$level} {$subject} student on: {$validated['topic']}. {$context}\n\nProvide questions in increasing difficulty. Include answers.",
            'explain_concept' => "Explain this {$level} {$subject} concept in a simple, clear way: {$validated['topic']}. {$context}\n\nUse analogies and simple language suitable for a student.",
            'suggest_activity' => "Suggest an engaging learning activity for a {$level} {$subject} student on: {$validated['topic']}. {$context}\n\nThe activity should be doable in a 1:1 online tutoring session.",
        ];

        $result = $this->ai->generate(
            "You are an expert teaching assistant helping a tutor during a live {$subject} lesson. Be concise and practical.",
            $prompts[$validated['action']]
        );

        return response()->json([
            'data' => [
                'action' => $validated['action'],
                'topic' => $validated['topic'],
                'response' => $result ?? 'AI is temporarily unavailable. Please try again.',
            ],
        ]);
    }
}
