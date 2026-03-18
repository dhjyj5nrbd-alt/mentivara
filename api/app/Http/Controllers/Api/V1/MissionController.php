<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\KnowledgeMapEntry;
use App\Models\Streak;
use App\Models\StudyMission;
use App\Models\XpLog;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MissionController extends Controller
{
    /**
     * Get today's study mission (generates if not exists).
     */
    public function today(Request $request): JsonResponse
    {
        $user = $request->user();
        $today = Carbon::today()->toDateString();

        $mission = StudyMission::where('user_id', $user->id)
            ->whereDate('date', $today)
            ->first();

        if (!$mission) {
            $mission = $this->generateMission($user->id, $today);
        }

        $streak = Streak::firstOrCreate(
            ['user_id' => $user->id],
            ['current_streak' => 0, 'longest_streak' => 0]
        );

        $totalXp = XpLog::where('user_id', $user->id)->sum('amount');

        return response()->json([
            'mission' => $mission,
            'streak' => $streak,
            'total_xp' => $totalXp,
        ]);
    }

    /**
     * Complete a task within today's mission.
     */
    public function completeTask(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'task_index' => ['required', 'integer', 'min:0'],
        ]);

        $user = $request->user();
        $today = Carbon::today()->toDateString();

        $mission = StudyMission::where('user_id', $user->id)
            ->whereDate('date', $today)
            ->firstOrFail();

        $tasks = $mission->tasks;
        if (!isset($tasks[$validated['task_index']])) {
            return response()->json(['message' => 'Invalid task index.'], 422);
        }

        $tasks[$validated['task_index']]['completed'] = true;

        // Check if all tasks completed
        $allCompleted = collect($tasks)->every(fn ($t) => $t['completed']);

        $updateData = ['tasks' => $tasks];

        if ($allCompleted && !$mission->completed) {
            $xp = 25;
            $updateData['completed'] = true;
            $updateData['xp_earned'] = $xp;

            XpLog::create([
                'user_id' => $user->id,
                'amount' => $xp,
                'source_type' => 'mission',
                'source_id' => $mission->id,
                'description' => 'Daily mission completed',
            ]);

            // Update streak
            $streak = Streak::firstOrCreate(
                ['user_id' => $user->id],
                ['current_streak' => 0, 'longest_streak' => 0]
            );

            $yesterday = Carbon::yesterday()->toDateString();
            if ($streak->last_active_date?->toDateString() === $yesterday) {
                $streak->current_streak++;
            } elseif ($streak->last_active_date?->toDateString() !== $today) {
                $streak->current_streak = 1;
            }

            $streak->longest_streak = max($streak->longest_streak, $streak->current_streak);
            $streak->last_active_date = $today;
            $streak->save();
        }

        $mission->forceFill($updateData)->save();

        return response()->json(['data' => $mission]);
    }

    private function generateMission(int $userId, string $date): StudyMission
    {
        // Get weak topics for personalized tasks
        $weakTopics = KnowledgeMapEntry::where('student_id', $userId)
            ->where('mastery_pct', '<', 70)
            ->with('topic')
            ->orderBy('mastery_pct')
            ->limit(3)
            ->get();

        $tasks = [
            ['type' => 'flashcard', 'title' => 'Review 10 flashcards', 'completed' => false],
            ['type' => 'quiz', 'title' => 'Complete a 5-question mini quiz', 'completed' => false],
            ['type' => 'practice', 'title' => 'Solve 3 practice problems', 'completed' => false],
        ];

        if ($weakTopics->isNotEmpty()) {
            $topic = $weakTopics->first()->topic;
            $tasks[] = ['type' => 'focus', 'title' => "Focus on: {$topic->name} ({$weakTopics->first()->mastery_pct}% mastery)", 'completed' => false];
        } else {
            $tasks[] = ['type' => 'explore', 'title' => 'Watch a tutor reel', 'completed' => false];
        }

        return StudyMission::create([
            'user_id' => $userId,
            'date' => $date,
            'tasks' => $tasks,
        ]);
    }
}
