<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ChatMessage;
use App\Models\Lesson;
use App\Models\WebrtcSignal;
use App\Models\WhiteboardStroke;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClassroomController extends Controller
{
    // Join classroom — returns lesson info + existing chat/whiteboard
    public function join(Request $request, int $lessonId): JsonResponse
    {
        $user = $request->user();
        $lesson = $this->getAuthorizedLesson($lessonId, $user->id);

        if (!$lesson) {
            return response()->json(['message' => 'Lesson not found.'], 404);
        }

        if ($lesson->status === 'cancelled') {
            return response()->json(['message' => 'This lesson has been cancelled.'], 422);
        }

        // Auto-start the lesson when someone joins
        if ($lesson->status === 'scheduled') {
            $lesson->update(['status' => 'in_progress']);
        }

        $messages = ChatMessage::where('lesson_id', $lessonId)
            ->with('user:id,name,avatar')
            ->orderBy('created_at')
            ->get();

        $strokes = WhiteboardStroke::where('lesson_id', $lessonId)
            ->orderBy('created_at')
            ->get();

        return response()->json([
            'lesson' => [
                'id' => $lesson->id,
                'tutor_id' => $lesson->tutor_id,
                'student_id' => $lesson->student_id,
                'tutor_name' => $lesson->tutor->name,
                'student_name' => $lesson->student->name,
                'subject' => $lesson->subject?->name,
                'scheduled_at' => $lesson->scheduled_at->toIso8601String(),
                'duration_minutes' => $lesson->duration_minutes,
                'status' => $lesson->status,
            ],
            'messages' => $messages,
            'strokes' => $strokes,
            'user_id' => $user->id,
            'role' => $user->id === $lesson->tutor_id ? 'tutor' : 'student',
            'peer_id' => $user->id === $lesson->tutor_id ? $lesson->student_id : $lesson->tutor_id,
        ]);
    }

    // End the lesson
    public function end(Request $request, int $lessonId): JsonResponse
    {
        $user = $request->user();
        $lesson = $this->getAuthorizedLesson($lessonId, $user->id);

        if (!$lesson) {
            return response()->json(['message' => 'Lesson not found.'], 404);
        }

        $lesson->update(['status' => 'completed']);

        return response()->json(['message' => 'Lesson ended.']);
    }

    // Send a chat message
    public function sendMessage(Request $request, int $lessonId): JsonResponse
    {
        $validated = $request->validate([
            'body' => ['required', 'string', 'max:2000'],
            'type' => ['in:text,file,system'],
            'file_url' => ['nullable', 'string', 'max:500'],
        ]);

        $user = $request->user();
        $lesson = $this->getAuthorizedLesson($lessonId, $user->id);

        if (!$lesson) {
            return response()->json(['message' => 'Lesson not found.'], 404);
        }

        $message = ChatMessage::create([
            'lesson_id' => $lessonId,
            'user_id' => $user->id,
            'body' => $validated['body'],
            'type' => $validated['type'] ?? 'text',
            'file_url' => $validated['file_url'] ?? null,
        ]);

        $message->load('user:id,name,avatar');

        return response()->json(['data' => $message], 201);
    }

    // Get new messages since a given ID (polling)
    public function pollMessages(Request $request, int $lessonId): JsonResponse
    {
        $user = $request->user();
        $lesson = $this->getAuthorizedLesson($lessonId, $user->id);

        if (!$lesson) {
            return response()->json(['message' => 'Lesson not found.'], 404);
        }

        $afterId = $request->integer('after', 0);

        $messages = ChatMessage::where('lesson_id', $lessonId)
            ->where('id', '>', $afterId)
            ->with('user:id,name,avatar')
            ->orderBy('created_at')
            ->get();

        return response()->json(['data' => $messages]);
    }

    // Add whiteboard stroke
    public function addStroke(Request $request, int $lessonId): JsonResponse
    {
        $validated = $request->validate([
            'data' => ['required', 'array'],
        ]);

        $user = $request->user();
        $lesson = $this->getAuthorizedLesson($lessonId, $user->id);

        if (!$lesson) {
            return response()->json(['message' => 'Lesson not found.'], 404);
        }

        $stroke = WhiteboardStroke::create([
            'lesson_id' => $lessonId,
            'user_id' => $user->id,
            'data' => $validated['data'],
        ]);

        return response()->json(['data' => $stroke], 201);
    }

    // Poll whiteboard strokes since a given ID
    public function pollStrokes(Request $request, int $lessonId): JsonResponse
    {
        $user = $request->user();
        $lesson = $this->getAuthorizedLesson($lessonId, $user->id);

        if (!$lesson) {
            return response()->json(['message' => 'Lesson not found.'], 404);
        }

        $afterId = $request->integer('after', 0);

        $strokes = WhiteboardStroke::where('lesson_id', $lessonId)
            ->where('id', '>', $afterId)
            ->orderBy('created_at')
            ->get();

        return response()->json(['data' => $strokes]);
    }

    // Clear whiteboard (tutor only)
    public function clearWhiteboard(Request $request, int $lessonId): JsonResponse
    {
        $user = $request->user();
        $lesson = $this->getAuthorizedLesson($lessonId, $user->id);

        if (!$lesson || $user->id !== $lesson->tutor_id) {
            return response()->json(['message' => 'Only the tutor can clear the whiteboard.'], 403);
        }

        WhiteboardStroke::where('lesson_id', $lessonId)->delete();

        return response()->json(['message' => 'Whiteboard cleared.']);
    }

    // WebRTC signaling: send signal
    public function sendSignal(Request $request, int $lessonId): JsonResponse
    {
        $validated = $request->validate([
            'to_user_id' => ['required', 'integer'],
            'type' => ['required', 'in:offer,answer,ice-candidate'],
            'payload' => ['required', 'array'],
        ]);

        $user = $request->user();
        $lesson = $this->getAuthorizedLesson($lessonId, $user->id);

        if (!$lesson) {
            return response()->json(['message' => 'Lesson not found.'], 404);
        }

        // Verify target is the other participant
        $validTarget = $validated['to_user_id'] === $lesson->tutor_id
            || $validated['to_user_id'] === $lesson->student_id;

        if (!$validTarget) {
            return response()->json(['message' => 'Invalid target user.'], 422);
        }

        WebrtcSignal::create([
            'lesson_id' => $lessonId,
            'from_user_id' => $user->id,
            'to_user_id' => $validated['to_user_id'],
            'type' => $validated['type'],
            'payload' => $validated['payload'],
        ]);

        return response()->json(['message' => 'Signal sent.'], 201);
    }

    // WebRTC signaling: poll for signals
    public function pollSignals(Request $request, int $lessonId): JsonResponse
    {
        $user = $request->user();
        $lesson = $this->getAuthorizedLesson($lessonId, $user->id);

        if (!$lesson) {
            return response()->json(['message' => 'Lesson not found.'], 404);
        }

        $signals = WebrtcSignal::where('lesson_id', $lessonId)
            ->where('to_user_id', $user->id)
            ->where('consumed', false)
            ->orderBy('created_at')
            ->get();

        // Mark as consumed
        WebrtcSignal::whereIn('id', $signals->pluck('id'))->update(['consumed' => true]);

        return response()->json(['data' => $signals]);
    }

    private function getAuthorizedLesson(int $lessonId, int $userId): ?Lesson
    {
        return Lesson::with(['tutor:id,name', 'student:id,name', 'subject:id,name'])
            ->where('id', $lessonId)
            ->where(function ($q) use ($userId) {
                $q->where('tutor_id', $userId)
                    ->orWhere('student_id', $userId);
            })
            ->first();
    }
}
