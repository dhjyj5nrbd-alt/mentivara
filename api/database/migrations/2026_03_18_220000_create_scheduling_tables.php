<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('availability_slots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tutor_profile_id')->constrained()->cascadeOnDelete();
            $table->tinyInteger('day_of_week'); // 0=Sun, 1=Mon...6=Sat
            $table->time('start_time');
            $table->time('end_time');
            $table->boolean('is_recurring')->default(true);
            $table->date('specific_date')->nullable(); // for one-off slots
            $table->timestamps();
        });

        Schema::create('lessons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tutor_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('subject_id')->nullable()->constrained()->nullOnDelete();
            $table->dateTime('scheduled_at');
            $table->integer('duration_minutes')->default(60);
            $table->enum('status', ['scheduled', 'in_progress', 'completed', 'cancelled'])->default('scheduled');
            $table->boolean('is_recurring')->default(false);
            $table->string('recurrence_group')->nullable(); // groups recurring lessons
            $table->string('recording_url')->nullable();
            $table->text('notes')->nullable();
            $table->enum('cancelled_by', ['tutor', 'student'])->nullable();
            $table->text('cancel_reason')->nullable();
            $table->timestamps();

            $table->index(['tutor_id', 'scheduled_at']);
            $table->index(['student_id', 'scheduled_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lessons');
        Schema::dropIfExists('availability_slots');
    }
};
