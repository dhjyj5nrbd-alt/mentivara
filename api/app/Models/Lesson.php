<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Lesson extends Model
{
    protected $fillable = [
        'tutor_id',
        'student_id',
        'subject_id',
        'scheduled_at',
        'duration_minutes',
        'status',
        'is_recurring',
        'recurrence_group',
        'recording_url',
        'notes',
        'cancelled_by',
        'cancel_reason',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_at' => 'datetime',
            'is_recurring' => 'boolean',
        ];
    }

    public function tutor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'tutor_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function scopeUpcoming($query)
    {
        return $query->where('scheduled_at', '>=', now())
            ->where('status', 'scheduled')
            ->orderBy('scheduled_at');
    }

    public function scopePast($query)
    {
        return $query->where(function ($q) {
            $q->where('scheduled_at', '<', now())
                ->orWhere('status', 'completed');
        })->orderByDesc('scheduled_at');
    }
}
