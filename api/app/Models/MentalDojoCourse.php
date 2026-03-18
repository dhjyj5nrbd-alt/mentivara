<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MentalDojoCourse extends Model
{
    protected $fillable = ['title', 'category', 'description', 'icon', 'order', 'modules_count'];

    public function modules(): HasMany
    {
        return $this->hasMany(MentalDojoModule::class, 'course_id')->orderBy('order');
    }
}
