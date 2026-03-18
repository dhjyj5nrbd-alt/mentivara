<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->timestamps();
        });

        Schema::create('levels', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->timestamps();
        });

        Schema::create('exam_boards', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->timestamps();
        });

        Schema::create('tutor_subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tutor_profile_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->foreignId('level_id')->constrained()->cascadeOnDelete();
            $table->foreignId('exam_board_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();

            $table->unique(['tutor_profile_id', 'subject_id', 'level_id', 'exam_board_id'], 'tutor_subject_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tutor_subjects');
        Schema::dropIfExists('exam_boards');
        Schema::dropIfExists('levels');
        Schema::dropIfExists('subjects');
    }
};
