<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ForumCategory extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'order',
    ];

    public function threads(): HasMany
    {
        return $this->hasMany(ForumThread::class, 'category_id');
    }
}
