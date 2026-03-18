<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LessonResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tutor' => [
                'id' => $this->tutor->id,
                'name' => $this->tutor->name,
                'avatar' => $this->tutor->avatar,
            ],
            'student' => [
                'id' => $this->student->id,
                'name' => $this->student->name,
                'avatar' => $this->student->avatar,
            ],
            'subject' => $this->subject ? [
                'id' => $this->subject->id,
                'name' => $this->subject->name,
            ] : null,
            'scheduled_at' => $this->scheduled_at->toIso8601String(),
            'duration_minutes' => $this->duration_minutes,
            'status' => $this->status,
            'is_recurring' => $this->is_recurring,
            'notes' => $this->notes,
            'recording_url' => $this->recording_url,
            'created_at' => $this->created_at,
        ];
    }
}
