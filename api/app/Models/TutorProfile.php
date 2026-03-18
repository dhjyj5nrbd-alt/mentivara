<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TutorProfile extends Model
{
    protected $fillable = [
        'user_id',
        'bio',
        'qualifications',
        'intro_video_url',
        'verified',
        'onboarding_complete',
    ];

    protected function casts(): array
    {
        return [
            'verified' => 'boolean',
            'onboarding_complete' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
