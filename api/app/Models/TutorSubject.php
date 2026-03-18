<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TutorSubject extends Model
{
    protected $fillable = [
        'tutor_profile_id',
        'subject_id',
        'level_id',
        'exam_board_id',
    ];

    public function tutorProfile(): BelongsTo
    {
        return $this->belongsTo(TutorProfile::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function level(): BelongsTo
    {
        return $this->belongsTo(Level::class);
    }

    public function examBoard(): BelongsTo
    {
        return $this->belongsTo(ExamBoard::class);
    }
}
