<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MentalDojoModule extends Model
{
    protected $fillable = ['course_id', 'title', 'type', 'content', 'duration_minutes', 'order', 'xp_reward'];

    protected function casts(): array
    {
        return ['content' => 'array'];
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(MentalDojoCourse::class, 'course_id');
    }
}
