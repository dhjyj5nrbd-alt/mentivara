<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lesson_packages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')->constrained()->cascadeOnDelete();
            $table->text('summary')->nullable();
            $table->json('key_notes')->nullable();
            $table->json('flashcards')->nullable(); // [{front, back}]
            $table->json('practice_questions')->nullable(); // [{question, hint}]
            $table->text('homework')->nullable();
            $table->enum('status', ['pending', 'generating', 'completed', 'failed'])->default('pending');
            $table->timestamps();

            $table->unique('lesson_id');
        });

        Schema::create('curriculum_topics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->foreignId('level_id')->constrained()->cascadeOnDelete();
            $table->foreignId('exam_board_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('parent_id')->nullable()->constrained('curriculum_topics')->nullOnDelete();
            $table->string('name');
            $table->integer('order')->default(0);
            $table->timestamps();

            $table->index(['subject_id', 'level_id']);
        });

        Schema::create('knowledge_map_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('topic_id')->constrained('curriculum_topics')->cascadeOnDelete();
            $table->integer('mastery_pct')->default(0); // 0-100
            $table->integer('questions_attempted')->default(0);
            $table->integer('questions_correct')->default(0);
            $table->timestamp('last_assessed_at')->nullable();
            $table->timestamps();

            $table->unique(['student_id', 'topic_id']);
        });

        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->foreignId('topic_id')->nullable()->constrained('curriculum_topics')->nullOnDelete();
            $table->foreignId('level_id')->constrained()->cascadeOnDelete();
            $table->foreignId('exam_board_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('type', ['mcq', 'short_answer', 'long_answer'])->default('mcq');
            $table->text('content');
            $table->json('options')->nullable(); // for MCQ: ["A", "B", "C", "D"]
            $table->text('correct_answer');
            $table->text('explanation')->nullable();
            $table->enum('difficulty', ['easy', 'medium', 'hard'])->default('medium');
            $table->boolean('ai_generated')->default(false);
            $table->timestamps();

            $table->index(['subject_id', 'level_id', 'difficulty']);
        });

        Schema::create('exam_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('subject_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('level_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->integer('time_limit_minutes')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->integer('score')->nullable(); // percentage 0-100
            $table->string('grade_prediction')->nullable();
            $table->timestamps();
        });

        Schema::create('exam_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_session_id')->constrained()->cascadeOnDelete();
            $table->foreignId('question_id')->constrained()->cascadeOnDelete();
            $table->text('student_answer')->nullable();
            $table->boolean('is_correct')->nullable();
            $table->text('ai_feedback')->nullable();
            $table->timestamps();
        });

        Schema::create('doubts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('tutor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('subject_id')->nullable()->constrained()->nullOnDelete();
            $table->text('question_text');
            $table->string('image_url')->nullable();
            $table->text('ai_answer')->nullable();
            $table->text('tutor_answer')->nullable();
            $table->string('tutor_media_url')->nullable();
            $table->enum('status', ['pending', 'ai_answered', 'escalated', 'tutor_answered'])->default('pending');
            $table->timestamps();

            $table->index(['student_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doubts');
        Schema::dropIfExists('exam_answers');
        Schema::dropIfExists('exam_sessions');
        Schema::dropIfExists('questions');
        Schema::dropIfExists('knowledge_map_entries');
        Schema::dropIfExists('curriculum_topics');
        Schema::dropIfExists('lesson_packages');
    }
};
