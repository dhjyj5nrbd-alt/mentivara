<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ExamSession extends Model
{
    protected $fillable = [
        'student_id', 'subject_id', 'level_id', 'title',
        'time_limit_minutes', 'started_at', 'completed_at',
        'score', 'grade_prediction',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function student(): BelongsTo { return $this->belongsTo(User::class, 'student_id'); }
    public function subject(): BelongsTo { return $this->belongsTo(Subject::class); }
    public function level(): BelongsTo { return $this->belongsTo(Level::class); }
    public function answers(): HasMany { return $this->hasMany(ExamAnswer::class); }
}
