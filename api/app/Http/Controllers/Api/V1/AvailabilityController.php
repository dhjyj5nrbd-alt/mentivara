<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AvailabilitySlot;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AvailabilityController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $slots = $request->user()->tutorProfile
            ->availabilitySlots()
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get();

        return response()->json(['data' => $slots]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'day_of_week' => ['required', 'integer', 'between:0,6'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'is_recurring' => ['boolean'],
            'specific_date' => ['nullable', 'date', 'after_or_equal:today'],
        ]);

        $profile = $request->user()->tutorProfile;

        // Check for overlapping slots on the same day
        $overlap = $profile->availabilitySlots()
            ->where('day_of_week', $validated['day_of_week'])
            ->where(function ($q) use ($validated) {
                $q->where(function ($q2) use ($validated) {
                    $q2->where('start_time', '<', $validated['end_time'])
                        ->where('end_time', '>', $validated['start_time']);
                });
            })
            ->exists();

        if ($overlap) {
            return response()->json(['message' => 'This slot overlaps with an existing one.'], 409);
        }

        $slot = AvailabilitySlot::create([
            'tutor_profile_id' => $profile->id,
            ...$validated,
        ]);

        return response()->json(['data' => $slot], 201);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $profile = $request->user()->tutorProfile;

        $deleted = AvailabilitySlot::where('id', $id)
            ->where('tutor_profile_id', $profile->id)
            ->delete();

        if (!$deleted) {
            return response()->json(['message' => 'Slot not found.'], 404);
        }

        return response()->json(['message' => 'Slot removed.']);
    }

    // Public: get a tutor's availability for booking
    public function forTutor(int $tutorProfileId): JsonResponse
    {
        $slots = AvailabilitySlot::where('tutor_profile_id', $tutorProfileId)
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get();

        return response()->json(['data' => $slots]);
    }
}
