<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KnowledgeMapEntry extends Model
{
    protected $fillable = [
        'student_id', 'topic_id', 'mastery_pct',
        'questions_attempted', 'questions_correct', 'last_assessed_at',
    ];

    protected function casts(): array
    {
        return ['last_assessed_at' => 'datetime'];
    }

    public function student(): BelongsTo { return $this->belongsTo(User::class, 'student_id'); }
    public function topic(): BelongsTo { return $this->belongsTo(CurriculumTopic::class, 'topic_id'); }
}
