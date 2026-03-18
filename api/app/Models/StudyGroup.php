<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StudyGroup extends Model
{
    protected $fillable = [
        'name',
        'description',
        'created_by',
        'is_private',
        'members_count',
    ];

    protected function casts(): array
    {
        return [
            'is_private' => 'boolean',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function members(): HasMany
    {
        return $this->hasMany(StudyGroupMember::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(StudyGroupMessage::class);
    }
}
