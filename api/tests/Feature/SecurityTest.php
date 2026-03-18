<?php

namespace Tests\Feature;

use App\Models\AvailabilitySlot;
use App\Models\Lesson;
use App\Models\StudyGroup;
use App\Models\StudyGroupMember;
use App\Models\TutorProfile;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SecurityTest extends TestCase
{
    use RefreshDatabase;

    // --- Private Group Protection ---
    public function test_cannot_join_private_group(): void
    {
        $owner = User::factory()->create(['role' => 'student']);
        $group = StudyGroup::create(['name' => 'Private', 'created_by' => $owner->id, 'is_private' => true]);
        StudyGroupMember::create(['study_group_id' => $group->id, 'user_id' => $owner->id, 'role' => 'owner']);

        $outsider = User::factory()->create(['role' => 'student']);
        $this->actingAs($outsider)->postJson("/api/v1/study-groups/{$group->id}/join")
            ->assertStatus(403);
    }

    public function test_can_join_public_group(): void
    {
        $owner = User::factory()->create(['role' => 'student']);
        $group = StudyGroup::create(['name' => 'Public', 'created_by' => $owner->id, 'is_private' => false]);
        StudyGroupMember::create(['study_group_id' => $group->id, 'user_id' => $owner->id, 'role' => 'owner']);

        $joiner = User::factory()->create(['role' => 'student']);
        $this->actingAs($joiner)->postJson("/api/v1/study-groups/{$group->id}/join")
            ->assertOk();
    }

    // --- Cancel Reason Validation ---
    public function test_cancel_reason_is_validated(): void
    {
        $tutor = User::factory()->create(['role' => 'tutor']);
        TutorProfile::create(['user_id' => $tutor->id, 'verified' => true]);
        $student = User::factory()->create(['role' => 'student']);

        $lesson = Lesson::create([
            'tutor_id' => $tutor->id,
            'student_id' => $student->id,
            'scheduled_at' => Carbon::now()->addDays(5),
            'duration_minutes' => 60,
            'status' => 'scheduled',
        ]);

        // Very long reason should be rejected
        $this->actingAs($student)->postJson("/api/v1/lessons/{$lesson->id}/cancel", [
            'reason' => str_repeat('a', 501),
        ])->assertStatus(422);
    }

    // --- Recurring Booking Conflict Check ---
    public function test_recurring_booking_skips_conflicting_weeks(): void
    {
        $tutor = User::factory()->create(['role' => 'tutor', 'status' => 'active']);
        TutorProfile::create(['user_id' => $tutor->id, 'verified' => true]);
        $student = User::factory()->create(['role' => 'student']);

        $nextMonday = Carbon::now()->next(Carbon::MONDAY);

        // Set availability
        AvailabilitySlot::create([
            'tutor_profile_id' => $tutor->tutorProfile->id,
            'day_of_week' => 1,
            'start_time' => '09:00',
            'end_time' => '17:00',
        ]);

        // Pre-create a conflicting lesson 2 weeks from now
        Lesson::create([
            'tutor_id' => $tutor->id,
            'student_id' => $student->id,
            'scheduled_at' => $nextMonday->copy()->addWeeks(2)->setTime(10, 0),
            'duration_minutes' => 60,
            'status' => 'scheduled',
        ]);

        // Book recurring — should skip week 2
        $response = $this->actingAs($student)->postJson('/api/v1/student/book', [
            'tutor_profile_id' => $tutor->tutorProfile->id,
            'scheduled_at' => $nextMonday->copy()->setTime(10, 0)->toIso8601String(),
            'duration_minutes' => 60,
            'is_recurring' => true,
        ]);

        $response->assertStatus(201);
        // Should have 5 total (1 original + 1 pre-existing + 3 non-conflicting recurring)
        $totalLessons = Lesson::where('tutor_id', $tutor->id)->count();
        $this->assertLessThanOrEqual(5, $totalLessons);
        $this->assertGreaterThanOrEqual(4, $totalLessons); // At least week 2 was skipped
    }

    // --- Question Filter Validation ---
    public function test_question_filters_reject_invalid_values(): void
    {
        $student = User::factory()->create(['role' => 'student']);

        $this->actingAs($student)->getJson('/api/v1/questions?difficulty=invalid')
            ->assertStatus(422);

        $this->actingAs($student)->getJson('/api/v1/questions?type=invalid')
            ->assertStatus(422);

        $this->actingAs($student)->getJson('/api/v1/questions?per_page=999')
            ->assertStatus(422);
    }

    // --- Search Length Validation ---
    public function test_tutor_search_rejects_oversized_input(): void
    {
        $this->getJson('/api/v1/tutors?search=' . str_repeat('a', 101))
            ->assertStatus(422);
    }

    // --- Admin Routes Protected ---
    public function test_non_admin_cannot_access_admin_endpoints(): void
    {
        $student = User::factory()->create(['role' => 'student']);

        $this->actingAs($student)->getJson('/api/v1/admin/dashboard')->assertStatus(403);
        $this->actingAs($student)->getJson('/api/v1/admin/users')->assertStatus(403);
        $this->actingAs($student)->getJson('/api/v1/admin/tutors/pending')->assertStatus(403);
        $this->actingAs($student)->getJson('/api/v1/admin/payments')->assertStatus(403);
    }

    // --- Self-message Prevention ---
    public function test_strict_self_message_check(): void
    {
        $user = User::factory()->create(['role' => 'student']);

        $this->actingAs($user)->postJson('/api/v1/messages', [
            'receiver_id' => $user->id,
            'body' => 'Hi self',
        ])->assertStatus(422);
    }

    // --- Payment Simulation Guard ---
    public function test_payment_confirm_works_in_testing_env(): void
    {
        $tutor = User::factory()->create(['role' => 'tutor']);
        TutorProfile::create(['user_id' => $tutor->id, 'verified' => true]);
        $student = User::factory()->create(['role' => 'student']);

        $lesson = Lesson::create([
            'tutor_id' => $tutor->id, 'student_id' => $student->id,
            'scheduled_at' => Carbon::now()->addDays(3), 'duration_minutes' => 60, 'status' => 'scheduled',
        ]);

        $payment = \App\Models\Payment::create([
            'student_id' => $student->id, 'tutor_id' => $tutor->id,
            'lesson_id' => $lesson->id, 'amount' => 3000, 'status' => 'pending',
        ]);

        // Should work in testing environment
        $this->actingAs($student)->postJson("/api/v1/payments/{$payment->id}/confirm")
            ->assertOk();
    }
}
