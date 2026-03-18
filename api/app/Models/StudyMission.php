<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudyMission extends Model
{
    protected $fillable = [
        'user_id',
        'date',
        'tasks',
        'completed',
        'xp_earned',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'tasks' => 'array',
            'completed' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
