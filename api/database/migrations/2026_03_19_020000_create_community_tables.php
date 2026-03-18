<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Tutor Reels
        Schema::create('reels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tutor_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('subject_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('video_url');
            $table->string('thumbnail_url')->nullable();
            $table->integer('views')->default(0);
            $table->integer('likes_count')->default(0);
            $table->timestamps();
        });

        Schema::create('reel_likes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reel_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['reel_id', 'user_id']);
        });

        Schema::create('reel_saves', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reel_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['reel_id', 'user_id']);
        });

        // Competitions
        Schema::create('competitions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tutor_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('reel_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->integer('xp_reward')->default(50);
            $table->timestamp('deadline')->nullable();
            $table->timestamps();
        });

        Schema::create('competition_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('competition_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->text('answer');
            $table->boolean('is_correct')->nullable();
            $table->timestamps();
            $table->unique(['competition_id', 'student_id']);
        });

        // Forum
        Schema::create('forum_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        Schema::create('forum_threads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('forum_categories')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('body');
            $table->boolean('pinned')->default(false);
            $table->boolean('locked')->default(false);
            $table->integer('replies_count')->default(0);
            $table->timestamps();
        });

        Schema::create('forum_replies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('thread_id')->constrained('forum_threads')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('body');
            $table->boolean('is_best_answer')->default(false);
            $table->timestamps();
        });

        Schema::create('forum_reports', function (Blueprint $table) {
            $table->id();
            $table->string('reportable_type');
            $table->unsignedBigInteger('reportable_id');
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('reason');
            $table->enum('status', ['pending', 'reviewed', 'dismissed'])->default('pending');
            $table->timestamps();
        });

        // Study Groups
        Schema::create('study_groups', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->boolean('is_private')->default(true);
            $table->integer('members_count')->default(1);
            $table->timestamps();
        });

        Schema::create('study_group_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('study_group_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('role', ['owner', 'member'])->default('member');
            $table->timestamps();
            $table->unique(['study_group_id', 'user_id']);
        });

        Schema::create('study_group_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('study_group_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('body');
            $table->string('media_url')->nullable();
            $table->timestamps();
        });

        // Messaging
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sender_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('receiver_id')->constrained('users')->cascadeOnDelete();
            $table->text('body');
            $table->string('media_url')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            $table->index(['sender_id', 'receiver_id', 'created_at']);
        });

        // XP + Streaks + Study Missions
        Schema::create('xp_log', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->integer('amount');
            $table->string('source_type'); // exam, competition, mission, lesson
            $table->unsignedBigInteger('source_id')->nullable();
            $table->string('description')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'created_at']);
        });

        Schema::create('streaks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->integer('current_streak')->default(0);
            $table->integer('longest_streak')->default(0);
            $table->date('last_active_date')->nullable();
            $table->timestamps();
            $table->unique('user_id');
        });

        Schema::create('study_missions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->json('tasks'); // [{type, title, completed}]
            $table->boolean('completed')->default(false);
            $table->integer('xp_earned')->default(0);
            $table->timestamps();
            $table->unique(['user_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('study_missions');
        Schema::dropIfExists('streaks');
        Schema::dropIfExists('xp_log');
        Schema::dropIfExists('messages');
        Schema::dropIfExists('study_group_messages');
        Schema::dropIfExists('study_group_members');
        Schema::dropIfExists('study_groups');
        Schema::dropIfExists('forum_reports');
        Schema::dropIfExists('forum_replies');
        Schema::dropIfExists('forum_threads');
        Schema::dropIfExists('forum_categories');
        Schema::dropIfExists('competition_entries');
        Schema::dropIfExists('competitions');
        Schema::dropIfExists('reel_saves');
        Schema::dropIfExists('reel_likes');
        Schema::dropIfExists('reels');
    }
};
