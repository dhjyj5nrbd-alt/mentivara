<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\LessonResource;
use App\Models\AvailabilitySlot;
use App\Models\Lesson;
use App\Models\TutorProfile;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tutor_profile_id' => ['required', 'exists:tutor_profiles,id'],
            'subject_id' => ['nullable', 'exists:subjects,id'],
            'scheduled_at' => ['required', 'date', 'after:now'],
            'duration_minutes' => ['integer', 'in:30,45,60,90,120'],
            'is_recurring' => ['boolean'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $tutorProfile = TutorProfile::with('user')->findOrFail($validated['tutor_profile_id']);
        $tutorUser = $tutorProfile->user;

        // Verify tutor is active and verified
        if ($tutorUser->status !== 'active' || !$tutorProfile->verified) {
            return response()->json(['message' => 'This tutor is not available for booking.'], 422);
        }

        // Prevent booking with yourself
        if ($tutorUser->id === $request->user()->id) {
            return response()->json(['message' => 'You cannot book a lesson with yourself.'], 422);
        }

        $scheduledAt = Carbon::parse($validated['scheduled_at']);
        $duration = $validated['duration_minutes'] ?? 60;

        // Check tutor has availability for this day/time
        $dayOfWeek = $scheduledAt->dayOfWeek;
        $time = $scheduledAt->format('H:i');
        $endTime = $scheduledAt->copy()->addMinutes($duration)->format('H:i');

        $hasSlot = AvailabilitySlot::where('tutor_profile_id', $tutorProfile->id)
            ->where('day_of_week', $dayOfWeek)
            ->where('start_time', '<=', $time)
            ->where('end_time', '>=', $endTime)
            ->exists();

        if (!$hasSlot) {
            return response()->json(['message' => 'The tutor is not available at this time.'], 422);
        }

        // Check for conflicting lessons (database-agnostic)
        $lessonEnd = $scheduledAt->copy()->addMinutes($duration);
        $conflict = Lesson::where('tutor_id', $tutorUser->id)
            ->where('status', 'scheduled')
            ->where('scheduled_at', '<', $lessonEnd)
            ->get()
            ->contains(function ($existing) use ($scheduledAt) {
                $existingEnd = $existing->scheduled_at->copy()->addMinutes($existing->duration_minutes);
                return $existingEnd->greaterThan($scheduledAt);
            });

        if ($conflict) {
            return response()->json(['message' => 'This time slot is already booked.'], 409);
        }

        $recurrenceGroup = null;
        if (!empty($validated['is_recurring'])) {
            $recurrenceGroup = uniqid('rec_');
        }

        $lesson = Lesson::create([
            'tutor_id' => $tutorUser->id,
            'student_id' => $request->user()->id,
            'subject_id' => $validated['subject_id'] ?? null,
            'scheduled_at' => $scheduledAt,
            'duration_minutes' => $duration,
            'status' => 'scheduled',
            'is_recurring' => $validated['is_recurring'] ?? false,
            'recurrence_group' => $recurrenceGroup,
            'notes' => $validated['notes'] ?? null,
        ]);

        // If recurring, create the next 4 weekly lessons
        if ($recurrenceGroup) {
            for ($i = 1; $i <= 4; $i++) {
                Lesson::create([
                    'tutor_id' => $tutorUser->id,
                    'student_id' => $request->user()->id,
                    'subject_id' => $validated['subject_id'] ?? null,
                    'scheduled_at' => $scheduledAt->copy()->addWeeks($i),
                    'duration_minutes' => $duration,
                    'status' => 'scheduled',
                    'is_recurring' => true,
                    'recurrence_group' => $recurrenceGroup,
                    'notes' => $validated['notes'] ?? null,
                ]);
            }
        }

        $lesson->load(['tutor', 'student', 'subject']);

        return (new LessonResource($lesson))
            ->response()
            ->setStatusCode(201);
    }

    public function cancel(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $lesson = Lesson::where('id', $id)
            ->where('status', 'scheduled')
            ->where(function ($q) use ($user) {
                $q->where('tutor_id', $user->id)
                    ->orWhere('student_id', $user->id);
            })
            ->firstOrFail();

        // Must cancel at least 24h before
        if (now()->diffInHours($lesson->scheduled_at, false) < 24) {
            return response()->json(['message' => 'Lessons must be cancelled at least 24 hours in advance.'], 422);
        }

        $validated = $request->validate([
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        $lesson->update([
            'status' => 'cancelled',
            'cancelled_by' => $user->role === 'tutor' ? 'tutor' : 'student',
            'cancel_reason' => $validated['reason'] ?? null,
        ]);

        return response()->json(['message' => 'Lesson cancelled.']);
    }
}
