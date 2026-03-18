<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_as_student(): void
    {
        $response = $this->postJson('/api/v1/register', [
            'name' => 'Test Student',
            'email' => 'student@test.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'student',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'user' => ['id', 'name', 'email', 'role'],
                'token',
            ])
            ->assertJsonPath('user.role', 'student')
            ->assertJsonPath('user.status', 'active');

        $this->assertDatabaseHas('users', ['email' => 'student@test.com', 'role' => 'student']);
        $this->assertDatabaseHas('students', ['user_id' => $response->json('user.id')]);
    }

    public function test_user_can_register_as_tutor_with_pending_status(): void
    {
        $response = $this->postJson('/api/v1/register', [
            'name' => 'Test Tutor',
            'email' => 'tutor@test.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'tutor',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('user.role', 'tutor')
            ->assertJsonPath('user.status', 'pending');

        $this->assertDatabaseHas('tutor_profiles', ['user_id' => $response->json('user.id')]);
    }

    public function test_user_can_register_as_parent(): void
    {
        $response = $this->postJson('/api/v1/register', [
            'name' => 'Test Parent',
            'email' => 'parent@test.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'parent',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('user.role', 'parent');

        $this->assertDatabaseHas('parents', ['user_id' => $response->json('user.id')]);
    }

    public function test_registration_fails_with_invalid_data(): void
    {
        $response = $this->postJson('/api/v1/register', [
            'name' => '',
            'email' => 'not-an-email',
            'password' => 'short',
            'role' => 'invalid',
        ]);

        $response->assertStatus(422);
    }

    public function test_registration_fails_with_duplicate_email(): void
    {
        User::factory()->create(['email' => 'taken@test.com']);

        $response = $this->postJson('/api/v1/register', [
            'name' => 'Duplicate',
            'email' => 'taken@test.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'student',
        ]);

        $response->assertStatus(422);
    }

    public function test_user_can_login(): void
    {
        User::factory()->create([
            'email' => 'login@test.com',
            'password' => bcrypt('password123'),
            'role' => 'student',
        ]);

        $response = $this->postJson('/api/v1/login', [
            'email' => 'login@test.com',
            'password' => 'password123',
        ]);

        $response->assertOk()
            ->assertJsonStructure([
                'user' => ['id', 'name', 'email', 'role'],
                'token',
            ]);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        User::factory()->create([
            'email' => 'wrong@test.com',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/v1/login', [
            'email' => 'wrong@test.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401);
    }

    public function test_suspended_user_cannot_login(): void
    {
        User::factory()->create([
            'email' => 'suspended@test.com',
            'password' => bcrypt('password123'),
            'status' => 'suspended',
        ]);

        $response = $this->postJson('/api/v1/login', [
            'email' => 'suspended@test.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(403);
    }

    public function test_authenticated_user_can_get_profile(): void
    {
        $user = User::factory()->create(['role' => 'student']);

        $response = $this->actingAs($user)->getJson('/api/v1/me');

        $response->assertOk()
            ->assertJsonPath('user.id', $user->id);
    }

    public function test_authenticated_user_can_logout(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/v1/logout');

        $response->assertOk();
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_unauthenticated_user_cannot_access_protected_routes(): void
    {
        $this->getJson('/api/v1/me')->assertStatus(401);
        $this->postJson('/api/v1/logout')->assertStatus(401);
    }

    public function test_role_middleware_blocks_wrong_role(): void
    {
        $student = User::factory()->create(['role' => 'student']);

        // Student trying to access admin routes should be blocked
        $this->actingAs($student)->getJson('/api/v1/admin')
            ->assertStatus(403);
    }
}
