<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Mental Dojo
        Schema::create('mental_dojo_courses', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('category'); // visualization, exam_calmness, breathing, focus, confidence, reflection
            $table->text('description')->nullable();
            $table->string('icon')->nullable();
            $table->integer('order')->default(0);
            $table->integer('modules_count')->default(0);
            $table->timestamps();
        });

        Schema::create('mental_dojo_modules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('mental_dojo_courses')->cascadeOnDelete();
            $table->string('title');
            $table->enum('type', ['lesson', 'exercise', 'reflection', 'breathing', 'visualization']);
            $table->json('content'); // {text, instructions, duration_seconds, audio_url, steps[]}
            $table->integer('duration_minutes')->default(5);
            $table->integer('order')->default(0);
            $table->integer('xp_reward')->default(10);
            $table->timestamps();
        });

        Schema::create('mental_dojo_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('module_id')->constrained('mental_dojo_modules')->cascadeOnDelete();
            $table->timestamp('completed_at');
            $table->integer('rating')->nullable(); // 1-5 how helpful
            $table->timestamps();
            $table->unique(['user_id', 'module_id']);
        });

        // AI Study Coach recommendations
        Schema::create('ai_coach_recommendations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type'); // weekly_review, focus_area, study_strategy, pattern_insight
            $table->text('content');
            $table->json('data')->nullable(); // structured data backing the recommendation
            $table->boolean('dismissed')->default(false);
            $table->timestamps();
            $table->index(['user_id', 'created_at']);
        });

        // AI Study Schedules
        Schema::create('study_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->json('schedule'); // [{day, blocks: [{start, end, subject, topic, type}]}]
            $table->json('preferences')->nullable(); // {available_hours, exam_dates, priorities}
            $table->date('week_start');
            $table->timestamps();
            $table->index(['user_id', 'week_start']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('study_schedules');
        Schema::dropIfExists('ai_coach_recommendations');
        Schema::dropIfExists('mental_dojo_progress');
        Schema::dropIfExists('mental_dojo_modules');
        Schema::dropIfExists('mental_dojo_courses');
    }
};
