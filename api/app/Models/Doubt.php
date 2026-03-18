<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Doubt extends Model
{
    protected $fillable = [
        'student_id', 'tutor_id', 'subject_id', 'question_text',
        'image_url', 'ai_answer', 'tutor_answer', 'tutor_media_url', 'status',
    ];

    public function student(): BelongsTo { return $this->belongsTo(User::class, 'student_id'); }
    public function tutor(): BelongsTo { return $this->belongsTo(User::class, 'tutor_id'); }
    public function subject(): BelongsTo { return $this->belongsTo(Subject::class); }
}
