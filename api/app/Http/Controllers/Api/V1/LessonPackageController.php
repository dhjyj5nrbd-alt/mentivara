<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ChatMessage;
use App\Models\Lesson;
use App\Models\LessonPackage;
use App\Services\AiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LessonPackageController extends Controller
{
    public function __construct(private AiService $ai) {}

    /**
     * Generate a lesson package for a completed lesson.
     */
    public function generate(Request $request, int $lessonId): JsonResponse
    {
        $user = $request->user();

        $lesson = Lesson::with(['tutor', 'student', 'subject'])
            ->where('id', $lessonId)
            ->where(function ($q) use ($user) {
                $q->where('tutor_id', $user->id)->orWhere('student_id', $user->id);
            })
            ->firstOrFail();

        // Check if package already exists
        $existing = LessonPackage::where('lesson_id', $lessonId)->first();
        if ($existing && $existing->status === 'completed') {
            return response()->json(['data' => $existing]);
        }

        $package = $existing ?? LessonPackage::create([
            'lesson_id' => $lessonId,
            'status' => 'generating',
        ]);

        $package->update(['status' => 'generating']);

        // Gather chat transcript for context
        $messages = ChatMessage::where('lesson_id', $lessonId)
            ->with('user:id,name')
            ->orderBy('created_at')
            ->get()
            ->map(fn ($m) => "{$m->user->name}: {$m->body}")
            ->implode("\n");

        $subject = $lesson->subject?->name ?? 'General';
        $transcript = $messages ?: 'No chat transcript available.';

        $result = $this->ai->generateJson(
            "You are an educational AI that creates lesson packages. Generate a comprehensive study package for a tutoring lesson.",
            "Subject: {$subject}\nTutor: {$lesson->tutor->name}\nStudent: {$lesson->student->name}\nDuration: {$lesson->duration_minutes} minutes\n\nChat transcript:\n{$transcript}\n\nGenerate a JSON object with these keys:\n- summary: 2-3 sentence lesson summary\n- key_notes: array of 4-6 key points\n- flashcards: array of 3-5 objects with 'front' and 'back'\n- practice_questions: array of 3-5 objects with 'question' and 'hint'\n- homework: homework assignment text"
        );

        if ($result) {
            $package->update([
                'summary' => $result['summary'] ?? null,
                'key_notes' => $result['key_notes'] ?? null,
                'flashcards' => $result['flashcards'] ?? null,
                'practice_questions' => $result['practice_questions'] ?? null,
                'homework' => $result['homework'] ?? null,
                'status' => 'completed',
            ]);
        } else {
            $package->update(['status' => 'failed']);
        }

        return response()->json(['data' => $package->fresh()], $existing ? 200 : 201);
    }

    /**
     * View a lesson package.
     */
    public function show(Request $request, int $lessonId): JsonResponse
    {
        $user = $request->user();

        Lesson::where('id', $lessonId)
            ->where(function ($q) use ($user) {
                $q->where('tutor_id', $user->id)
                    ->orWhere('student_id', $user->id);
            })
            ->firstOrFail();

        $package = LessonPackage::where('lesson_id', $lessonId)->first();

        if (!$package) {
            return response()->json(['message' => 'No package generated yet.'], 404);
        }

        return response()->json(['data' => $package]);
    }
}
