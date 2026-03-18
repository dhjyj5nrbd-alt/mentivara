<?php

namespace Tests\Feature;

use App\Models\Lesson;
use App\Models\TutorProfile;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminTest extends TestCase
{
    use RefreshDatabase;

    private function createAdmin(): User
    {
        return User::factory()->create(['role' => 'admin', 'status' => 'active']);
    }

    public function test_admin_can_view_dashboard_stats(): void
    {
        $admin = $this->createAdmin();
        User::factory()->count(3)->create(['role' => 'student']);
        User::factory()->create(['role' => 'tutor', 'status' => 'pending']);

        $response = $this->actingAs($admin)->getJson('/api/v1/admin/dashboard');

        $response->assertOk()
            ->assertJsonStructure(['stats' => [
                'total_users', 'total_students', 'total_tutors', 'pending_tutors',
            ]]);
        $this->assertEquals(3, $response->json('stats.total_students'));
        $this->assertEquals(1, $response->json('stats.pending_tutors'));
    }

    public function test_admin_can_list_users(): void
    {
        $admin = $this->createAdmin();
        User::factory()->count(5)->create(['role' => 'student']);

        $response = $this->actingAs($admin)->getJson('/api/v1/admin/users');
        $response->assertOk();
        $this->assertEquals(6, $response->json('total')); // 5 students + admin
    }

    public function test_admin_can_filter_users_by_role(): void
    {
        $admin = $this->createAdmin();
        User::factory()->count(3)->create(['role' => 'student']);
        User::factory()->count(2)->create(['role' => 'tutor']);

        $response = $this->actingAs($admin)->getJson('/api/v1/admin/users?role=tutor');
        $this->assertEquals(2, $response->json('total'));
    }

    public function test_admin_can_search_users(): void
    {
        $admin = $this->createAdmin();
        User::factory()->create(['name' => 'Alice Smith', 'role' => 'student']);
        User::factory()->create(['name' => 'Bob Jones', 'role' => 'student']);

        $response = $this->actingAs($admin)->getJson('/api/v1/admin/users?search=Alice');
        $this->assertEquals(1, $response->json('total'));
    }

    public function test_admin_can_view_single_user(): void
    {
        $admin = $this->createAdmin();
        $student = User::factory()->create(['role' => 'student']);

        $response = $this->actingAs($admin)->getJson("/api/v1/admin/users/{$student->id}");
        $response->assertOk()
            ->assertJsonPath('data.id', $student->id);
    }

    public function test_admin_can_update_user_status(): void
    {
        $admin = $this->createAdmin();
        $student = User::factory()->create(['role' => 'student', 'status' => 'active']);

        $response = $this->actingAs($admin)->patchJson("/api/v1/admin/users/{$student->id}/status", [
            'status' => 'suspended',
        ]);

        $response->assertOk();
        $this->assertEquals('suspended', $student->fresh()->status);
    }

    public function test_admin_cannot_suspend_self(): void
    {
        $admin = $this->createAdmin();

        $this->actingAs($admin)->patchJson("/api/v1/admin/users/{$admin->id}/status", [
            'status' => 'suspended',
        ])->assertStatus(422);
    }

    public function test_admin_can_view_pending_tutors(): void
    {
        $admin = $this->createAdmin();
        $tutor = User::factory()->create(['role' => 'tutor', 'status' => 'pending']);
        TutorProfile::create(['user_id' => $tutor->id]);

        $response = $this->actingAs($admin)->getJson('/api/v1/admin/tutors/pending');
        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
    }

    public function test_admin_can_approve_tutor(): void
    {
        $admin = $this->createAdmin();
        $tutor = User::factory()->create(['role' => 'tutor', 'status' => 'pending']);
        TutorProfile::create(['user_id' => $tutor->id, 'verified' => false]);

        $response = $this->actingAs($admin)->postJson("/api/v1/admin/tutors/{$tutor->id}/approve");

        $response->assertOk();
        $this->assertEquals('active', $tutor->fresh()->status);
        $this->assertTrue($tutor->fresh()->tutorProfile->verified);
    }

    public function test_admin_can_reject_tutor(): void
    {
        $admin = $this->createAdmin();
        $tutor = User::factory()->create(['role' => 'tutor', 'status' => 'pending']);
        TutorProfile::create(['user_id' => $tutor->id]);

        $response = $this->actingAs($admin)->postJson("/api/v1/admin/tutors/{$tutor->id}/reject");

        $response->assertOk();
        $this->assertEquals('suspended', $tutor->fresh()->status);
    }

    public function test_admin_can_delete_user(): void
    {
        $admin = $this->createAdmin();
        $student = User::factory()->create(['role' => 'student']);

        $this->actingAs($admin)->deleteJson("/api/v1/admin/users/{$student->id}")
            ->assertOk();

        $this->assertDatabaseMissing('users', ['id' => $student->id]);
    }

    public function test_admin_cannot_delete_self(): void
    {
        $admin = $this->createAdmin();

        $this->actingAs($admin)->deleteJson("/api/v1/admin/users/{$admin->id}")
            ->assertStatus(422);
    }

    public function test_non_admin_cannot_access_admin_routes(): void
    {
        $student = User::factory()->create(['role' => 'student']);

        $this->actingAs($student)->getJson('/api/v1/admin/dashboard')
            ->assertStatus(403);
    }
}
