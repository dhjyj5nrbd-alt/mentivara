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
        $query = TutorProfile::query()
            ->whereHas('user', fn ($q) => $q->where('status', 'active'))
            ->where('verified', true)
            ->with(['user', 'tutorSubjects.subject', 'tutorSubjects.level', 'tutorSubjects.examBoard']);

        // Filter by subject
        if ($request->has('subject')) {
            $query->whereHas('tutorSubjects.subject', function ($q) use ($request) {
                $q->where('slug', $request->subject);
            });
        }

        // Filter by level
        if ($request->has('level')) {
            $query->whereHas('tutorSubjects.level', function ($q) use ($request) {
                $q->where('slug', $request->level);
            });
        }

        // Filter by exam board
        if ($request->has('exam_board')) {
            $query->whereHas('tutorSubjects.examBoard', function ($q) use ($request) {
                $q->where('slug', $request->exam_board);
            });
        }

        // Search by name
        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        $tutors = $query->paginate($request->integer('per_page', 12));

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
