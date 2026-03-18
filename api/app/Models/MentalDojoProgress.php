<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MentalDojoProgress extends Model
{
    protected $table = 'mental_dojo_progress';

    protected $fillable = ['user_id', 'module_id', 'completed_at', 'rating'];

    protected function casts(): array
    {
        return ['completed_at' => 'datetime'];
    }

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function module(): BelongsTo { return $this->belongsTo(MentalDojoModule::class, 'module_id'); }
}
