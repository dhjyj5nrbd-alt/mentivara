<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ForumThread extends Model
{
    protected $fillable = [
        'category_id',
        'user_id',
        'title',
        'body',
        'pinned',
        'locked',
        'replies_count',
    ];

    protected function casts(): array
    {
        return [
            'pinned' => 'boolean',
            'locked' => 'boolean',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ForumCategory::class, 'category_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function replies(): HasMany
    {
        return $this->hasMany(ForumReply::class, 'thread_id');
    }
}
