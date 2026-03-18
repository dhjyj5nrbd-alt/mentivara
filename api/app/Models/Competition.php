<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Competition extends Model
{
    protected $fillable = [
        'tutor_id',
        'reel_id',
        'title',
        'description',
        'xp_reward',
        'deadline',
    ];

    protected function casts(): array
    {
        return [
            'deadline' => 'datetime',
        ];
    }

    public function tutor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'tutor_id');
    }

    public function reel(): BelongsTo
    {
        return $this->belongsTo(Reel::class);
    }

    public function entries(): HasMany
    {
        return $this->hasMany(CompetitionEntry::class);
    }
}
