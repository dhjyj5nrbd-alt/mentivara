<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudySchedule extends Model
{
    protected $fillable = ['user_id', 'schedule', 'preferences', 'week_start'];

    protected function casts(): array
    {
        return ['schedule' => 'array', 'preferences' => 'array', 'week_start' => 'date'];
    }

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}
