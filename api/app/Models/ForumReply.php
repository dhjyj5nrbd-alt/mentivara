<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ForumReply extends Model
{
    protected $fillable = [
        'thread_id',
        'user_id',
        'body',
        'is_best_answer',
    ];

    protected function casts(): array
    {
        return [
            'is_best_answer' => 'boolean',
        ];
    }

    public function thread(): BelongsTo
    {
        return $this->belongsTo(ForumThread::class, 'thread_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
