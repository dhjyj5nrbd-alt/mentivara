<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CurriculumTopic extends Model
{
    protected $fillable = [
        'subject_id', 'level_id', 'exam_board_id', 'parent_id', 'name', 'order',
    ];

    public function subject(): BelongsTo { return $this->belongsTo(Subject::class); }
    public function level(): BelongsTo { return $this->belongsTo(Level::class); }
    public function parent(): BelongsTo { return $this->belongsTo(CurriculumTopic::class, 'parent_id'); }
    public function children(): HasMany { return $this->hasMany(CurriculumTopic::class, 'parent_id')->orderBy('order'); }
    public function questions(): HasMany { return $this->hasMany(Question::class, 'topic_id'); }
}
