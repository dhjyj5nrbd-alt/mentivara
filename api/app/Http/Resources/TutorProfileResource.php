<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TutorProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'bio' => $this->bio,
            'qualifications' => $this->qualifications,
            'intro_video_url' => $this->intro_video_url,
            'verified' => $this->verified,
            'onboarding_complete' => $this->onboarding_complete,
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
                'avatar' => $this->user->avatar,
            ],
            'subjects' => $this->tutorSubjects->map(fn ($ts) => [
                'id' => $ts->id,
                'subject' => $ts->subject ? ['id' => $ts->subject->id, 'name' => $ts->subject->name, 'slug' => $ts->subject->slug] : null,
                'level' => $ts->level ? ['id' => $ts->level->id, 'name' => $ts->level->name, 'slug' => $ts->level->slug] : null,
                'exam_board' => $ts->examBoard ? ['id' => $ts->examBoard->id, 'name' => $ts->examBoard->name, 'slug' => $ts->examBoard->slug] : null,
            ]),
            'created_at' => $this->created_at,
        ];
    }
}
