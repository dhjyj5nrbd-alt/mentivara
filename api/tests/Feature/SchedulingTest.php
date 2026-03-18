<?php

namespace Tests\Feature;

use App\Models\AvailabilitySlot;
use App\Models\Lesson;
use App\Models\Subject;
use App\Models\TutorProfile;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SchedulingTest extends TestCase
{
    use RefreshDatabase;

    private function createVerifiedTutor(): User
    {
        $user = User::factory()->create(['role' => 'tutor', 'status' => 'active']);
        TutorProfile::create(['user_id' => $user->id, 'verified' => true]);
        return $user;
    }

    private function createStudent(): User
    {
        return User::factory()->create(['role' => 'student', 'status' => 'active']);
    }

    // --- Availability Tests ---

    public function test_tutor_can_add_availability_slot(): void
    {
        $tutor = $this->createVerifiedTutor();

        $response = $this->actingAs($tutor)->postJson('/api/v1/tutor/availability', [
            'day_of_week' => 1, // Monday
            'start_time' => '09:00',
            'end_time' => '12:00',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseCount('availability_slots', 1);
    }

    public function test_tutor_cannot_add_overlapping_slot(): void
    {
        $tutor = $this->createVerifiedTutor();
        AvailabilitySlot::create([
            'tutor_profile_id' => $tutor->tutorProfile->id,
            'day_of_week' => 1,
            'start_time' => '09:00',
            'end_time' => '12:00',
        ]);

        $response = $this->actingAs($tutor)->postJson('/api/v1/tutor/availability', [
            'day_of_week' => 1,
            'start_time' => '10:00',
            'end_time' => '13:00',
        ]);

        $response->assertStatus(409);
    }

    public function test_tutor_can_list_availability(): void
    {
        $tutor = $this->createVerifiedTutor();
        AvailabilitySlot::create([
            'tutor_profile_id' => $tutor->tutorProfile->id,
            'day_of_week' => 1,
            'start_time' => '09:00',
            'end_time' => '12:00',
        ]);

        $response = $this->actingAs($tutor)->getJson('/api/v1/tutor/availability');

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_tutor_can_delete_availability(): void
    {
        $tutor = $this->createVerifiedTutor();
        $slot = AvailabilitySlot::create([
            'tutor_profile_id' => $tutor->tutorProfile->id,
            'day_of_week' => 1,
            'start_time' => '09:00',
            'end_time' => '12:00',
        ]);

        $response = $this->actingAs($tutor)->deleteJson("/api/v1/tutor/availability/{$slot->id}");

        $response->assertOk();
        $this->assertDatabaseCount('availability_slots', 0);
    }

    public function test_public_can_view_tutor_availability(): void
    {
        $tutor = $this->createVerifiedTutor();
        AvailabilitySlot::create([
            'tutor_profile_id' => $tutor->tutorProfile->id,
            'day_of_week' => 1,
            'start_time' => '09:00',
            'end_time' => '12:00',
        ]);

        $response = $this->getJson("/api/v1/tutors/{$tutor->tutorProfile->id}/availability");

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    // --- Booking Tests ---

    public function test_student_can_book_lesson(): void
    {
        $tutor = $this->createVerifiedTutor();
        $student = $this->createStudent();

        // Set availability for next Monday
        $nextMonday = Carbon::now()->next(Carbon::MONDAY);
        AvailabilitySlot::create([
            'tutor_profile_id' => $tutor->tutorProfile->id,
            'day_of_week' => 1, // Monday
            'start_time' => '09:00',
            'end_time' => '17:00',
        ]);

        $response = $this->actingAs($student)->postJson('/api/v1/student/book', [
            'tutor_profile_id' => $tutor->tutorProfile->id,
            'scheduled_at' => $nextMonday->copy()->setTime(10, 0)->toIso8601String(),
            'duration_minutes' => 60,
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'tutor', 'student', 'scheduled_at', 'duration_minutes', 'status']]);

        $this->assertEquals('scheduled', $response->json('data.status'));
        $this->assertDatabaseCount('lessons', 1);
    }

    public function test_student_cannot_book_outside_availability(): void
    {
        $tutor = $this->createVerifiedTutor();
        $student = $this->createStudent();

        // Tutor only available Monday
        AvailabilitySlot::create([
            'tutor_profile_id' => $tutor->tutorProfile->id,
            'day_of_week' => 1,
            'start_time' => '09:00',
            'end_time' => '12:00',
        ]);

        // Try to book on Tuesday
        $nextTuesday = Carbon::now()->next(Carbon::TUESDAY);

        $response = $this->actingAs($student)->postJson('/api/v1/student/book', [
            'tutor_profile_id' => $tutor->tutorProfile->id,
            'scheduled_at' => $nextTuesday->copy()->setTime(10, 0)->toIso8601String(),
            'duration_minutes' => 60,
        ]);

        $response->assertStatus(422);
    }

    public function test_recurring_booking_creates_5_lessons(): void
    {
        $tutor = $this->createVerifiedTutor();
        $student = $this->createStudent();

        $nextMonday = Carbon::now()->next(Carbon::MONDAY);
        AvailabilitySlot::create([
            'tutor_profile_id' => $tutor->tutorProfile->id,
            'day_of_week' => 1,
            'start_time' => '09:00',
            'end_time' => '17:00',
        ]);

        $response = $this->actingAs($student)->postJson('/api/v1/student/book', [
            'tutor_profile_id' => $tutor->tutorProfile->id,
            'scheduled_at' => $nextMonday->copy()->setTime(10, 0)->toIso8601String(),
            'duration_minutes' => 60,
            'is_recurring' => true,
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseCount('lessons', 5); // original + 4 weekly
    }

    public function test_cannot_book_with_unverified_tutor(): void
    {
        $user = User::factory()->create(['role' => 'tutor', 'status' => 'active']);
        TutorProfile::create(['user_id' => $user->id, 'verified' => false]);
        $student = $this->createStudent();

        $response = $this->actingAs($student)->postJson('/api/v1/student/book', [
            'tutor_profile_id' => $user->tutorProfile->id,
            'scheduled_at' => Carbon::now()->addDays(3)->setTime(10, 0)->toIso8601String(),
            'duration_minutes' => 60,
        ]);

        $response->assertStatus(422);
    }

    // --- Lesson View Tests ---

    public function test_user_can_view_upcoming_lessons(): void
    {
        $tutor = $this->createVerifiedTutor();
        $student = $this->createStudent();

        Lesson::create([
            'tutor_id' => $tutor->id,
            'student_id' => $student->id,
            'scheduled_at' => Carbon::now()->addDays(2),
            'duration_minutes' => 60,
            'status' => 'scheduled',
        ]);

        $response = $this->actingAs($student)->getJson('/api/v1/lessons/upcoming');

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_user_can_view_past_lessons(): void
    {
        $tutor = $this->createVerifiedTutor();
        $student = $this->createStudent();

        Lesson::create([
            'tutor_id' => $tutor->id,
            'student_id' => $student->id,
            'scheduled_at' => Carbon::now()->subDays(2),
            'duration_minutes' => 60,
            'status' => 'completed',
        ]);

        $response = $this->actingAs($student)->getJson('/api/v1/lessons/past');

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_user_can_view_single_lesson(): void
    {
        $tutor = $this->createVerifiedTutor();
        $student = $this->createStudent();

        $lesson = Lesson::create([
            'tutor_id' => $tutor->id,
            'student_id' => $student->id,
            'scheduled_at' => Carbon::now()->addDays(2),
            'duration_minutes' => 60,
        ]);

        $response = $this->actingAs($student)->getJson("/api/v1/lessons/{$lesson->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $lesson->id);
    }

    public function test_user_cannot_view_others_lesson(): void
    {
        $tutor = $this->createVerifiedTutor();
        $student1 = $this->createStudent();
        $student2 = $this->createStudent();

        $lesson = Lesson::create([
            'tutor_id' => $tutor->id,
            'student_id' => $student1->id,
            'scheduled_at' => Carbon::now()->addDays(2),
            'duration_minutes' => 60,
        ]);

        $this->actingAs($student2)->getJson("/api/v1/lessons/{$lesson->id}")
            ->assertStatus(404);
    }

    public function test_lesson_can_be_cancelled(): void
    {
        $tutor = $this->createVerifiedTutor();
        $student = $this->createStudent();

        $lesson = Lesson::create([
            'tutor_id' => $tutor->id,
            'student_id' => $student->id,
            'scheduled_at' => Carbon::now()->addDays(3),
            'duration_minutes' => 60,
        ]);

        $response = $this->actingAs($student)->postJson("/api/v1/lessons/{$lesson->id}/cancel", [
            'reason' => 'Schedule conflict',
        ]);

        $response->assertOk();
        $this->assertEquals('cancelled', $lesson->fresh()->status);
        $this->assertEquals('student', $lesson->fresh()->cancelled_by);
    }

    public function test_calendar_returns_lessons_in_range(): void
    {
        $tutor = $this->createVerifiedTutor();
        $student = $this->createStudent();

        Lesson::create([
            'tutor_id' => $tutor->id,
            'student_id' => $student->id,
            'scheduled_at' => Carbon::now()->addDays(2),
            'duration_minutes' => 60,
        ]);

        // Lesson outside range
        Lesson::create([
            'tutor_id' => $tutor->id,
            'student_id' => $student->id,
            'scheduled_at' => Carbon::now()->addMonths(2),
            'duration_minutes' => 60,
        ]);

        $from = Carbon::now()->toDateString();
        $to = Carbon::now()->addWeek()->toDateString();

        $response = $this->actingAs($student)->getJson("/api/v1/lessons/calendar?from={$from}&to={$to}");

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }
}
