<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\LessonResource;
use App\Models\Lesson;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class LessonController extends Controller
{
    public function upcoming(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();

        $lessons = Lesson::with(['tutor', 'student', 'subject'])
            ->where(function ($q) use ($user) {
                $q->where('tutor_id', $user->id)
                    ->orWhere('student_id', $user->id);
            })
            ->upcoming()
            ->paginate(20);

        return LessonResource::collection($lessons);
    }

    public function past(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();

        $lessons = Lesson::with(['tutor', 'student', 'subject'])
            ->where(function ($q) use ($user) {
                $q->where('tutor_id', $user->id)
                    ->orWhere('student_id', $user->id);
            })
            ->past()
            ->paginate(20);

        return LessonResource::collection($lessons);
    }

    public function show(Request $request, int $id): LessonResource
    {
        $user = $request->user();

        $lesson = Lesson::with(['tutor', 'student', 'subject'])
            ->where('id', $id)
            ->where(function ($q) use ($user) {
                $q->where('tutor_id', $user->id)
                    ->orWhere('student_id', $user->id);
            })
            ->firstOrFail();

        return new LessonResource($lesson);
    }

    // Calendar view: all lessons for a date range
    public function calendar(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'from' => ['required', 'date'],
            'to' => ['required', 'date', 'after_or_equal:from'],
        ]);

        $user = $request->user();

        $lessons = Lesson::with(['tutor', 'student', 'subject'])
            ->where(function ($q) use ($user) {
                $q->where('tutor_id', $user->id)
                    ->orWhere('student_id', $user->id);
            })
            ->whereBetween('scheduled_at', [$request->from, $request->to])
            ->whereIn('status', ['scheduled', 'in_progress', 'completed'])
            ->orderBy('scheduled_at')
            ->get();

        return LessonResource::collection($lessons);
    }
}
