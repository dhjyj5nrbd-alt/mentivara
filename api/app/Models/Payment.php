<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    protected $fillable = [
        'student_id',
        'tutor_id',
        'lesson_id',
        'amount',
        'currency',
        'status',
        'stripe_payment_intent_id',
        'stripe_checkout_session_id',
        'description',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function tutor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'tutor_id');
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    public function getFormattedAmountAttribute(): string
    {
        return number_format($this->amount / 100, 2);
    }
}
