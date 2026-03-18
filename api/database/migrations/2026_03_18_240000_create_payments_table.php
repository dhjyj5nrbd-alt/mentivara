<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('tutor_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('lesson_id')->nullable()->constrained()->nullOnDelete();
            $table->integer('amount'); // in pence/cents
            $table->string('currency', 3)->default('gbp');
            $table->enum('status', ['pending', 'completed', 'failed', 'refunded'])->default('pending');
            $table->string('stripe_payment_intent_id')->nullable()->unique();
            $table->string('stripe_checkout_session_id')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();

            $table->index(['student_id', 'created_at']);
            $table->index(['tutor_id', 'created_at']);
        });

        // Add hourly_rate to tutor_profiles
        Schema::table('tutor_profiles', function (Blueprint $table) {
            $table->integer('hourly_rate')->nullable()->after('onboarding_complete'); // in pence
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
        Schema::table('tutor_profiles', function (Blueprint $table) {
            $table->dropColumn('hourly_rate');
        });
    }
};
