<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\MentalDojoCourse;
use App\Models\MentalDojoModule;
use App\Models\MentalDojoProgress;
use App\Models\XpLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MentalDojoController extends Controller
{
    public function courses(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $courses = MentalDojoCourse::orderBy('order')->get()->map(function ($course) use ($userId) {
            $completedCount = MentalDojoProgress::where('user_id', $userId)
                ->whereHas('module', fn ($q) => $q->where('course_id', $course->id))
                ->count();

            return [
                'id' => $course->id,
                'title' => $course->title,
                'category' => $course->category,
                'description' => $course->description,
                'icon' => $course->icon,
                'modules_count' => $course->modules_count,
                'completed_count' => $completedCount,
                'progress_pct' => $course->modules_count > 0
                    ? round(($completedCount / $course->modules_count) * 100)
                    : 0,
            ];
        });

        return response()->json(['data' => $courses]);
    }

    public function courseModules(Request $request, int $courseId): JsonResponse
    {
        $course = MentalDojoCourse::findOrFail($courseId);
        $userId = $request->user()->id;

        $modules = $course->modules->map(function ($module) use ($userId) {
            $progress = MentalDojoProgress::where('user_id', $userId)
                ->where('module_id', $module->id)
                ->first();

            return [
                'id' => $module->id,
                'title' => $module->title,
                'type' => $module->type,
                'content' => $module->content,
                'duration_minutes' => $module->duration_minutes,
                'xp_reward' => $module->xp_reward,
                'completed' => (bool) $progress,
                'completed_at' => $progress?->completed_at,
                'rating' => $progress?->rating,
            ];
        });

        return response()->json([
            'course' => $course->only('id', 'title', 'category', 'description'),
            'modules' => $modules,
        ]);
    }

    public function completeModule(Request $request, int $moduleId): JsonResponse
    {
        $module = MentalDojoModule::findOrFail($moduleId);
        $userId = $request->user()->id;

        $existing = MentalDojoProgress::where('user_id', $userId)
            ->where('module_id', $moduleId)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Already completed.', 'data' => $existing]);
        }

        $validated = $request->validate([
            'rating' => ['nullable', 'integer', 'min:1', 'max:5'],
        ]);

        $progress = MentalDojoProgress::create([
            'user_id' => $userId,
            'module_id' => $moduleId,
            'completed_at' => now(),
            'rating' => $validated['rating'] ?? null,
        ]);

        // Award XP
        XpLog::create([
            'user_id' => $userId,
            'amount' => $module->xp_reward,
            'source_type' => 'mental_dojo',
            'source_id' => $moduleId,
            'description' => "Completed: {$module->title}",
        ]);

        return response()->json(['data' => $progress], 201);
    }
}
