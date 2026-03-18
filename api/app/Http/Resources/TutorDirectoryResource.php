<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TutorDirectoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->user->name,
            'avatar' => $this->user->avatar,
            'bio' => $this->bio,
            'verified' => $this->verified,
            'subjects' => $this->tutorSubjects
                ->groupBy(fn ($ts) => $ts->subject->name)
                ->map(fn ($group, $subjectName) => [
                    'name' => $subjectName,
                    'levels' => $group->map(fn ($ts) => $ts->level->name)->unique()->values(),
                ])
                ->values(),
        ];
    }
}
