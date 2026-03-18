<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\TutorProfileResource;
use App\Models\TutorSubject;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TutorProfileController extends Controller
{
    public function show(Request $request): TutorProfileResource
    {
        $profile = $request->user()->tutorProfile()
            ->with(['user', 'tutorSubjects.subject', 'tutorSubjects.level', 'tutorSubjects.examBoard'])
            ->firstOrFail();

        return new TutorProfileResource($profile);
    }

    public function update(Request $request): TutorProfileResource
    {
        $validated = $request->validate([
            'bio' => ['sometimes', 'string', 'max:2000'],
            'qualifications' => ['sometimes', 'string', 'max:2000'],
            'intro_video_url' => ['sometimes', 'nullable', 'url', 'max:500'],
            'hourly_rate' => ['sometimes', 'integer', 'min:500', 'max:50000'], // £5–£500
        ]);

        $profile = $request->user()->tutorProfile;
        $profile->update($validated);

        $profile->load(['user', 'tutorSubjects.subject', 'tutorSubjects.level', 'tutorSubjects.examBoard']);

        return new TutorProfileResource($profile);
    }

    public function addSubject(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'subject_id' => ['required', 'exists:subjects,id'],
            'level_id' => ['required', 'exists:levels,id'],
            'exam_board_id' => ['nullable', 'exists:exam_boards,id'],
        ]);

        $profile = $request->user()->tutorProfile;

        $existing = TutorSubject::where([
            'tutor_profile_id' => $profile->id,
            'subject_id' => $validated['subject_id'],
            'level_id' => $validated['level_id'],
            'exam_board_id' => $validated['exam_board_id'] ?? null,
        ])->exists();

        if ($existing) {
            return response()->json(['message' => 'Subject already added.'], 409);
        }

        TutorSubject::create([
            'tutor_profile_id' => $profile->id,
            'subject_id' => $validated['subject_id'],
            'level_id' => $validated['level_id'],
            'exam_board_id' => $validated['exam_board_id'] ?? null,
        ]);

        $profile->load(['user', 'tutorSubjects.subject', 'tutorSubjects.level', 'tutorSubjects.examBoard']);

        return response()->json(new TutorProfileResource($profile), 201);
    }

    public function removeSubject(Request $request, int $tutorSubjectId): JsonResponse
    {
        $profile = $request->user()->tutorProfile;

        $deleted = TutorSubject::where('id', $tutorSubjectId)
            ->where('tutor_profile_id', $profile->id)
            ->delete();

        if (!$deleted) {
            return response()->json(['message' => 'Subject not found.'], 404);
        }

        return response()->json(['message' => 'Subject removed.']);
    }
}
