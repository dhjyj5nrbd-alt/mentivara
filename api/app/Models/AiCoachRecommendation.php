<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiCoachRecommendation extends Model
{
    protected $fillable = ['user_id', 'type', 'content', 'data', 'dismissed'];

    protected function casts(): array
    {
        return ['data' => 'array', 'dismissed' => 'boolean'];
    }

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}
