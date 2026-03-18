<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LessonPackage extends Model
{
    protected $fillable = [
        'lesson_id', 'summary', 'key_notes', 'flashcards',
        'practice_questions', 'homework', 'status',
    ];

    protected function casts(): array
    {
        return [
            'key_notes' => 'array',
            'flashcards' => 'array',
            'practice_questions' => 'array',
        ];
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }
}
