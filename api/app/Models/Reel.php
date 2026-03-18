<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Reel extends Model
{
    protected $fillable = [
        'tutor_id',
        'subject_id',
        'title',
        'description',
        'video_url',
        'thumbnail_url',
        'views',
        'likes_count',
    ];

    public function tutor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'tutor_id');
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function reelLikes(): HasMany
    {
        return $this->hasMany(ReelLike::class);
    }

    public function reelSaves(): HasMany
    {
        return $this->hasMany(ReelSave::class);
    }
}
