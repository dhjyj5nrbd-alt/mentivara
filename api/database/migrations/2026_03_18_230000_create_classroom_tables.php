<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chat_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('body');
            $table->string('type')->default('text'); // text, file, system
            $table->string('file_url')->nullable();
            $table->timestamps();

            $table->index(['lesson_id', 'created_at']);
        });

        Schema::create('whiteboard_strokes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->json('data'); // stroke path data
            $table->timestamps();

            $table->index('lesson_id');
        });

        // Signaling table for WebRTC offer/answer/ICE exchange
        Schema::create('webrtc_signals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')->constrained()->cascadeOnDelete();
            $table->foreignId('from_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('to_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('type'); // offer, answer, ice-candidate
            $table->json('payload');
            $table->boolean('consumed')->default(false);
            $table->timestamps();

            $table->index(['lesson_id', 'to_user_id', 'consumed']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('webrtc_signals');
        Schema::dropIfExists('whiteboard_strokes');
        Schema::dropIfExists('chat_messages');
    }
};
