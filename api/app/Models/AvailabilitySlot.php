<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AvailabilitySlot extends Model
{
    protected $fillable = [
        'tutor_profile_id',
        'day_of_week',
        'start_time',
        'end_time',
        'is_recurring',
        'specific_date',
    ];

    protected function casts(): array
    {
        return [
            'is_recurring' => 'boolean',
            'specific_date' => 'date',
        ];
    }

    public function tutorProfile(): BelongsTo
    {
        return $this->belongsTo(TutorProfile::class);
    }
}
