<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\KnowledgeMapEntry;
use App\Models\StudySchedule;
use App\Services\AiService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudyScheduleController extends Controller
{
    public function __construct(private AiService $ai) {}

    /**
     * Get the current week's study schedule.
     */
    public function current(Request $request): JsonResponse
    {
        $weekStart = Carbon::now()->startOfWeek()->toDateString();

        $schedule = StudySchedule::where('user_id', $request->user()->id)
            ->whereDate('week_start', $weekStart)
            ->first();

        return response()->json(['data' => $schedule]);
    }

    /**
     * Generate an optimized study schedule.
     */
    public function generate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'available_hours' => ['required', 'array'], // {mon: 2, tue: 1.5, ...}
            'exam_dates' => ['nullable', 'array'], // [{subject, date}]
            'priorities' => ['nullable', 'array'], // [subject_ids]
        ]);

        $user = $request->user();
        $weekStart = Carbon::now()->startOfWeek();

        // Get weak topics for prioritization
        $weakTopics = KnowledgeMapEntry::where('student_id', $user->id)
            ->where('mastery_pct', '<', 70)
            ->with('topic.subject')
            ->orderBy('mastery_pct')
            ->limit(10)
            ->get()
            ->map(fn ($e) => "{$e->topic->subject->name}: {$e->topic->name} ({$e->mastery_pct}%)")
            ->toArray();

        $context = "Available hours per day: " . json_encode($validated['available_hours']) . "\n";
        if (!empty($validated['exam_dates'])) {
            $context .= "Upcoming exams: " . json_encode($validated['exam_dates']) . "\n";
        }
        if (!empty($weakTopics)) {
            $context .= "Weak topics to focus on: " . implode(', ', $weakTopics) . "\n";
        }

        $result = $this->ai->generateJson(
            "You are an AI study planner for a UK student. Create an optimized weekly study schedule. Prioritize weak topics and upcoming exams. Include breaks.",
            "{$context}\n\nGenerate a JSON array of 7 objects (Monday to Sunday), each with:\n- day: day name\n- blocks: array of study blocks, each with {start: 'HH:MM', end: 'HH:MM', subject: string, topic: string, type: 'study'|'practice'|'review'|'break'}"
        );

        $schedule = StudySchedule::updateOrCreate(
            ['user_id' => $user->id, 'week_start' => $weekStart->toDateString()],
            [
                'schedule' => $result ?? $this->defaultSchedule($validated['available_hours']),
                'preferences' => $validated,
            ]
        );

        return response()->json(['data' => $schedule], 201);
    }

    /**
     * Get schedule history.
     */
    public function history(Request $request): JsonResponse
    {
        $schedules = StudySchedule::where('user_id', $request->user()->id)
            ->orderByDesc('week_start')
            ->limit(8)
            ->get();

        return response()->json(['data' => $schedules]);
    }

    private function defaultSchedule(array $hours): array
    {
        $days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        $dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
        $subjects = ['Mathematics', 'English', 'Biology', 'Chemistry', 'Physics'];

        $schedule = [];
        foreach ($days as $i => $day) {
            $dayHours = $hours[$dayKeys[$i]] ?? 0;
            $blocks = [];

            if ($dayHours > 0) {
                $startHour = 16; // 4pm default start
                $subjectIdx = $i % count($subjects);

                for ($h = 0; $h < $dayHours; $h++) {
                    $blocks[] = [
                        'start' => sprintf('%02d:00', $startHour + $h),
                        'end' => sprintf('%02d:45', $startHour + $h),
                        'subject' => $subjects[($subjectIdx + $h) % count($subjects)],
                        'topic' => 'General revision',
                        'type' => $h % 2 === 0 ? 'study' : 'practice',
                    ];
                    if ($h < $dayHours - 1) {
                        $blocks[] = [
                            'start' => sprintf('%02d:45', $startHour + $h),
                            'end' => sprintf('%02d:00', $startHour + $h + 1),
                            'subject' => '',
                            'topic' => 'Break',
                            'type' => 'break',
                        ];
                    }
                }
            }

            $schedule[] = ['day' => $day, 'blocks' => $blocks];
        }

        return $schedule;
    }
}
