<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\TutorDirectoryResource;
use App\Http\Resources\TutorProfileResource;
use App\Models\TutorProfile;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TutorDirectoryController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $validated = $request->validate([
            'subject' => ['nullable', 'string', 'max:50'],
            'level' => ['nullable', 'string', 'max:50'],
            'exam_board' => ['nullable', 'string', 'max:50'],
            'search' => ['nullable', 'string', 'max:100'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $query = TutorProfile::query()
            ->whereHas('user', fn ($q) => $q->where('status', 'active'))
            ->where('verified', true)
            ->with(['user', 'tutorSubjects.subject', 'tutorSubjects.level', 'tutorSubjects.examBoard']);

        if (!empty($validated['subject'])) {
            $query->whereHas('tutorSubjects.subject', fn ($q) => $q->where('slug', $validated['subject']));
        }

        if (!empty($validated['level'])) {
            $query->whereHas('tutorSubjects.level', fn ($q) => $q->where('slug', $validated['level']));
        }

        if (!empty($validated['exam_board'])) {
            $query->whereHas('tutorSubjects.examBoard', fn ($q) => $q->where('slug', $validated['exam_board']));
        }

        if (!empty($validated['search'])) {
            $search = $validated['search'];
            $query->whereHas('user', fn ($q) => $q->where('name', 'like', "%{$search}%"));
        }

        $tutors = $query->paginate($validated['per_page'] ?? 12);

        return TutorDirectoryResource::collection($tutors);
    }

    public function show(int $id): TutorProfileResource
    {
        $profile = TutorProfile::where('id', $id)
            ->whereHas('user', fn ($q) => $q->where('status', 'active'))
            ->with(['user', 'tutorSubjects.subject', 'tutorSubjects.level', 'tutorSubjects.examBoard'])
            ->firstOrFail();

        return new TutorProfileResource($profile);
    }
}
