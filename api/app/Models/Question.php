<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Question extends Model
{
    protected $fillable = [
        'subject_id', 'topic_id', 'level_id', 'exam_board_id',
        'type', 'content', 'options', 'correct_answer',
        'explanation', 'difficulty', 'ai_generated',
    ];

    protected function casts(): array
    {
        return [
            'options' => 'array',
            'ai_generated' => 'boolean',
        ];
    }

    public function subject(): BelongsTo { return $this->belongsTo(Subject::class); }
    public function topic(): BelongsTo { return $this->belongsTo(CurriculumTopic::class, 'topic_id'); }
    public function level(): BelongsTo { return $this->belongsTo(Level::class); }
    public function examBoard(): BelongsTo { return $this->belongsTo(ExamBoard::class); }
}
