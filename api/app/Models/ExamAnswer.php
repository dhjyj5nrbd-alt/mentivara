<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExamAnswer extends Model
{
    protected $fillable = [
        'exam_session_id', 'question_id', 'student_answer', 'is_correct', 'ai_feedback',
    ];

    protected function casts(): array
    {
        return ['is_correct' => 'boolean'];
    }

    public function examSession(): BelongsTo { return $this->belongsTo(ExamSession::class); }
    public function question(): BelongsTo { return $this->belongsTo(Question::class); }
}
