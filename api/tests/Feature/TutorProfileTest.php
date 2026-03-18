<?php

namespace Tests\Feature;

use App\Models\ExamBoard;
use App\Models\Level;
use App\Models\Subject;
use App\Models\TutorProfile;
use App\Models\TutorSubject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TutorProfileTest extends TestCase
{
    use RefreshDatabase;

    private function seedCurriculum(): void
    {
        Subject::create(['name' => 'Mathematics', 'slug' => 'maths']);
        Subject::create(['name' => 'Physics', 'slug' => 'physics']);
        Level::create(['name' => 'GCSE', 'slug' => 'gcse']);
        Level::create(['name' => 'A Level', 'slug' => 'a-level']);
        ExamBoard::create(['name' => 'AQA', 'slug' => 'aqa']);
    }

    private function createTutor(array $profileAttrs = [], bool $active = true): User
    {
        $user = User::factory()->create([
            'role' => 'tutor',
            'status' => $active ? 'active' : 'pending',
        ]);
        TutorProfile::create(array_merge(['user_id' => $user->id], $profileAttrs));
        return $user;
    }

    public function test_tutor_can_view_own_profile(): void
    {
        $tutor = $this->createTutor(['bio' => 'Expert tutor']);

        $response = $this->actingAs($tutor)->getJson('/api/v1/tutor/profile');

        $response->assertOk()
            ->assertJsonPath('data.bio', 'Expert tutor')
            ->assertJsonPath('data.user.id', $tutor->id);
    }

    public function test_tutor_can_update_profile(): void
    {
        $tutor = $this->createTutor();

        $response = $this->actingAs($tutor)->putJson('/api/v1/tutor/profile', [
            'bio' => 'Updated bio text',
            'qualifications' => 'PhD Mathematics',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.bio', 'Updated bio text')
            ->assertJsonPath('data.qualifications', 'PhD Mathematics');
    }

    public function test_tutor_can_add_subject(): void
    {
        $this->seedCurriculum();
        $tutor = $this->createTutor();

        $response = $this->actingAs($tutor)->postJson('/api/v1/tutor/profile/subjects', [
            'subject_id' => Subject::where('slug', 'maths')->first()->id,
            'level_id' => Level::where('slug', 'gcse')->first()->id,
            'exam_board_id' => ExamBoard::where('slug', 'aqa')->first()->id,
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseCount('tutor_subjects', 1);
    }

    public function test_tutor_cannot_add_duplicate_subject(): void
    {
        $this->seedCurriculum();
        $tutor = $this->createTutor();
        $subjectId = Subject::where('slug', 'maths')->first()->id;
        $levelId = Level::where('slug', 'gcse')->first()->id;

        TutorSubject::create([
            'tutor_profile_id' => $tutor->tutorProfile->id,
            'subject_id' => $subjectId,
            'level_id' => $levelId,
        ]);

        $response = $this->actingAs($tutor)->postJson('/api/v1/tutor/profile/subjects', [
            'subject_id' => $subjectId,
            'level_id' => $levelId,
        ]);

        $response->assertStatus(409);
    }

    public function test_tutor_can_remove_subject(): void
    {
        $this->seedCurriculum();
        $tutor = $this->createTutor();

        $ts = TutorSubject::create([
            'tutor_profile_id' => $tutor->tutorProfile->id,
            'subject_id' => Subject::first()->id,
            'level_id' => Level::first()->id,
        ]);

        $response = $this->actingAs($tutor)->deleteJson("/api/v1/tutor/profile/subjects/{$ts->id}");

        $response->assertOk();
        $this->assertDatabaseCount('tutor_subjects', 0);
    }

    public function test_student_cannot_access_tutor_routes(): void
    {
        $student = User::factory()->create(['role' => 'student']);

        $this->actingAs($student)->getJson('/api/v1/tutor/profile')
            ->assertStatus(403);
    }

    public function test_directory_lists_verified_tutors(): void
    {
        $this->seedCurriculum();

        // Verified tutor with subject
        $verifiedTutor = $this->createTutor(['bio' => 'Verified', 'verified' => true]);
        TutorSubject::create([
            'tutor_profile_id' => $verifiedTutor->tutorProfile->id,
            'subject_id' => Subject::first()->id,
            'level_id' => Level::first()->id,
        ]);

        // Unverified tutor
        $this->createTutor(['bio' => 'Unverified', 'verified' => false]);

        $response = $this->getJson('/api/v1/tutors');

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
        $this->assertEquals('Verified', $response->json('data.0.bio'));
    }

    public function test_directory_filters_by_subject(): void
    {
        $this->seedCurriculum();

        $mathsTutor = $this->createTutor(['verified' => true]);
        TutorSubject::create([
            'tutor_profile_id' => $mathsTutor->tutorProfile->id,
            'subject_id' => Subject::where('slug', 'maths')->first()->id,
            'level_id' => Level::first()->id,
        ]);

        $physicsTutor = $this->createTutor(['verified' => true]);
        TutorSubject::create([
            'tutor_profile_id' => $physicsTutor->tutorProfile->id,
            'subject_id' => Subject::where('slug', 'physics')->first()->id,
            'level_id' => Level::first()->id,
        ]);

        $response = $this->getJson('/api/v1/tutors?subject=maths');
        $this->assertCount(1, $response->json('data'));

        $response = $this->getJson('/api/v1/tutors?subject=physics');
        $this->assertCount(1, $response->json('data'));
    }

    public function test_directory_filters_by_level(): void
    {
        $this->seedCurriculum();

        $gcseTutor = $this->createTutor(['verified' => true]);
        TutorSubject::create([
            'tutor_profile_id' => $gcseTutor->tutorProfile->id,
            'subject_id' => Subject::first()->id,
            'level_id' => Level::where('slug', 'gcse')->first()->id,
        ]);

        $aLevelTutor = $this->createTutor(['verified' => true]);
        TutorSubject::create([
            'tutor_profile_id' => $aLevelTutor->tutorProfile->id,
            'subject_id' => Subject::first()->id,
            'level_id' => Level::where('slug', 'a-level')->first()->id,
        ]);

        $response = $this->getJson('/api/v1/tutors?level=gcse');
        $this->assertCount(1, $response->json('data'));
    }

    public function test_directory_search_by_name(): void
    {
        $this->seedCurriculum();

        $tutor = $this->createTutor(['verified' => true]);
        $tutor->update(['name' => 'Alice Johnson']);
        TutorSubject::create([
            'tutor_profile_id' => $tutor->tutorProfile->id,
            'subject_id' => Subject::first()->id,
            'level_id' => Level::first()->id,
        ]);

        $response = $this->getJson('/api/v1/tutors?search=Alice');
        $this->assertCount(1, $response->json('data'));

        $response = $this->getJson('/api/v1/tutors?search=Nonexistent');
        $this->assertCount(0, $response->json('data'));
    }

    public function test_can_view_single_tutor_profile(): void
    {
        $this->seedCurriculum();

        $tutor = $this->createTutor(['bio' => 'Detailed bio', 'verified' => true]);
        TutorSubject::create([
            'tutor_profile_id' => $tutor->tutorProfile->id,
            'subject_id' => Subject::first()->id,
            'level_id' => Level::first()->id,
        ]);

        $response = $this->getJson("/api/v1/tutors/{$tutor->tutorProfile->id}");

        $response->assertOk()
            ->assertJsonPath('data.bio', 'Detailed bio')
            ->assertJsonStructure(['data' => ['id', 'bio', 'subjects', 'user']]);
    }

    public function test_reference_data_endpoints(): void
    {
        $this->seedCurriculum();

        $this->getJson('/api/v1/subjects')->assertOk()->assertJsonCount(2);
        $this->getJson('/api/v1/levels')->assertOk()->assertJsonCount(2);
        $this->getJson('/api/v1/exam-boards')->assertOk()->assertJsonCount(1);
    }
}
