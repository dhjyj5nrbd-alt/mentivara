<?php

namespace Tests\Feature;

use App\Models\AiCoachRecommendation;
use App\Models\MentalDojoCourse;
use App\Models\MentalDojoModule;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class Phase4Test extends TestCase
{
    use RefreshDatabase;

    private function student(): User
    {
        return User::factory()->create(['role' => 'student']);
    }

    private function seedDojo(): void
    {
        $course = MentalDojoCourse::create([
            'title' => 'Exam Calmness', 'category' => 'exam_calmness',
            'description' => 'Stay calm.', 'order' => 1, 'modules_count' => 2,
        ]);
        MentalDojoModule::create([
            'course_id' => $course->id, 'title' => 'Understanding Anxiety', 'type' => 'lesson',
            'content' => ['text' => 'Anxiety is normal.'], 'order' => 0, 'xp_reward' => 10,
        ]);
        MentalDojoModule::create([
            'course_id' => $course->id, 'title' => 'Box Breathing', 'type' => 'breathing',
            'content' => ['instructions' => 'Breathe in 4, hold 4, out 4.'], 'order' => 1, 'xp_reward' => 10,
        ]);
    }

    // --- Mental Dojo ---
    public function test_courses_listed_with_progress(): void
    {
        $this->seedDojo();
        $student = $this->student();

        $response = $this->actingAs($student)->getJson('/api/v1/mental-dojo/courses');
        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
        $this->assertEquals(0, $response->json('data.0.progress_pct'));
    }

    public function test_course_modules_listed(): void
    {
        $this->seedDojo();
        $course = MentalDojoCourse::first();
        $student = $this->student();

        $response = $this->actingAs($student)->getJson("/api/v1/mental-dojo/courses/{$course->id}/modules");
        $response->assertOk();
        $this->assertCount(2, $response->json('modules'));
        $this->assertFalse($response->json('modules.0.completed'));
    }

    public function test_completing_module_awards_xp(): void
    {
        $this->seedDojo();
        $module = MentalDojoModule::first();
        $student = $this->student();

        $response = $this->actingAs($student)->postJson("/api/v1/mental-dojo/modules/{$module->id}/complete", [
            'rating' => 5,
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('mental_dojo_progress', ['user_id' => $student->id, 'module_id' => $module->id]);
        $this->assertDatabaseHas('xp_log', ['user_id' => $student->id, 'amount' => 10, 'source_type' => 'mental_dojo']);
    }

    public function test_cannot_complete_module_twice(): void
    {
        $this->seedDojo();
        $module = MentalDojoModule::first();
        $student = $this->student();

        $this->actingAs($student)->postJson("/api/v1/mental-dojo/modules/{$module->id}/complete");
        $response = $this->actingAs($student)->postJson("/api/v1/mental-dojo/modules/{$module->id}/complete");
        $response->assertOk(); // returns existing, not 201
    }

    public function test_progress_updates_after_completion(): void
    {
        $this->seedDojo();
        $module = MentalDojoModule::first();
        $student = $this->student();

        $this->actingAs($student)->postJson("/api/v1/mental-dojo/modules/{$module->id}/complete");

        $courses = $this->actingAs($student)->getJson('/api/v1/mental-dojo/courses');
        $this->assertEquals(50, $courses->json('data.0.progress_pct')); // 1/2 modules
    }

    // --- AI Study Coach ---
    public function test_coach_generates_recommendations(): void
    {
        $student = $this->student();

        $response = $this->actingAs($student)->postJson('/api/v1/coach/generate');
        $response->assertStatus(201);
        $this->assertNotEmpty($response->json('data'));
    }

    public function test_coach_recommendations_listed(): void
    {
        $student = $this->student();
        AiCoachRecommendation::create([
            'user_id' => $student->id, 'type' => 'focus_area',
            'content' => 'Focus on algebra.', 'data' => [],
        ]);

        $response = $this->actingAs($student)->getJson('/api/v1/coach/recommendations');
        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
    }

    public function test_coach_recommendation_can_be_dismissed(): void
    {
        $student = $this->student();
        $rec = AiCoachRecommendation::create([
            'user_id' => $student->id, 'type' => 'focus_area',
            'content' => 'Test', 'data' => [],
        ]);

        $this->actingAs($student)->postJson("/api/v1/coach/recommendations/{$rec->id}/dismiss")->assertOk();
        $this->assertTrue($rec->fresh()->dismissed);
    }

    public function test_coach_stats_returns_data(): void
    {
        $student = $this->student();

        $response = $this->actingAs($student)->getJson('/api/v1/coach/stats');
        $response->assertOk()
            ->assertJsonStructure(['data' => [
                'total_xp', 'current_streak', 'lessons_completed', 'exams_completed',
            ]]);
    }

    // --- Study Schedule ---
    public function test_schedule_can_be_generated(): void
    {
        $student = $this->student();

        $response = $this->actingAs($student)->postJson('/api/v1/schedule/generate', [
            'available_hours' => ['mon' => 2, 'tue' => 1.5, 'wed' => 2, 'thu' => 1, 'fri' => 2, 'sat' => 3, 'sun' => 0],
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseCount('study_schedules', 1);
        $this->assertNotNull($response->json('data.schedule'));
    }

    public function test_current_schedule_returned(): void
    {
        $student = $this->student();

        $this->actingAs($student)->postJson('/api/v1/schedule/generate', [
            'available_hours' => ['mon' => 2],
        ]);

        $response = $this->actingAs($student)->getJson('/api/v1/schedule/current');
        $response->assertOk();
        $this->assertNotNull($response->json('data'));
    }

    public function test_schedule_history(): void
    {
        $student = $this->student();

        $this->actingAs($student)->postJson('/api/v1/schedule/generate', [
            'available_hours' => ['mon' => 1],
        ]);

        $response = $this->actingAs($student)->getJson('/api/v1/schedule/history');
        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
    }
}
