<?php

namespace Tests\Feature;

use App\Models\CurriculumTopic;
use App\Models\Doubt;
use App\Models\ExamSession;
use App\Models\Lesson;
use App\Models\Level;
use App\Models\Question;
use App\Models\Subject;
use App\Models\TutorProfile;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class Phase2Test extends TestCase
{
    use RefreshDatabase;

    private function seedData(): void
    {
        $maths = Subject::create(['name' => 'Mathematics', 'slug' => 'maths']);
        $gcse = Level::create(['name' => 'GCSE', 'slug' => 'gcse']);
        $topic = CurriculumTopic::create(['subject_id' => $maths->id, 'level_id' => $gcse->id, 'name' => 'Algebra', 'order' => 0]);

        for ($i = 0; $i < 10; $i++) {
            Question::create([
                'subject_id' => $maths->id,
                'level_id' => $gcse->id,
                'topic_id' => $topic->id,
                'type' => 'mcq',
                'content' => "Question {$i}",
                'options' => ['A', 'B', 'C', 'D'],
                'correct_answer' => 'A',
                'difficulty' => 'easy',
            ]);
        }
    }

    private function createLessonPair(string $status = 'completed'): array
    {
        $tutor = User::factory()->create(['role' => 'tutor']);
        TutorProfile::create(['user_id' => $tutor->id, 'verified' => true]);
        $student = User::factory()->create(['role' => 'student']);
        $lesson = Lesson::create([
            'tutor_id' => $tutor->id, 'student_id' => $student->id,
            'scheduled_at' => Carbon::now()->subHour(), 'duration_minutes' => 60, 'status' => $status,
        ]);
        return [$tutor, $student, $lesson];
    }

    // --- Lesson Package ---
    public function test_lesson_package_can_be_generated(): void
    {
        [$tutor, $student, $lesson] = $this->createLessonPair();

        $response = $this->actingAs($tutor)->postJson("/api/v1/lessons/{$lesson->id}/package/generate");

        $response->assertStatus(201);
        $this->assertDatabaseHas('lesson_packages', ['lesson_id' => $lesson->id, 'status' => 'completed']);
    }

    public function test_lesson_package_can_be_viewed(): void
    {
        [$tutor, $student, $lesson] = $this->createLessonPair();
        $this->actingAs($tutor)->postJson("/api/v1/lessons/{$lesson->id}/package/generate");

        $response = $this->actingAs($student)->getJson("/api/v1/lessons/{$lesson->id}/package");
        $response->assertOk()->assertJsonStructure(['data' => ['summary', 'flashcards']]);
    }

    // --- AI Copilot ---
    public function test_tutor_can_use_copilot(): void
    {
        [$tutor, , $lesson] = $this->createLessonPair('in_progress');

        $response = $this->actingAs($tutor)->postJson("/api/v1/classroom/{$lesson->id}/copilot", [
            'action' => 'generate_example',
            'topic' => 'Quadratic equations',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['data' => ['action', 'topic', 'response']]);
    }

    public function test_student_cannot_use_copilot(): void
    {
        [, $student, $lesson] = $this->createLessonPair('in_progress');

        $this->actingAs($student)->postJson("/api/v1/classroom/{$lesson->id}/copilot", [
            'action' => 'explain_concept',
            'topic' => 'Test',
        ])->assertStatus(404); // student is not the tutor
    }

    // --- Exam Simulator ---
    public function test_student_can_start_exam(): void
    {
        $this->seedData();
        $student = User::factory()->create(['role' => 'student']);
        $maths = Subject::where('slug', 'maths')->first();
        $gcse = Level::where('slug', 'gcse')->first();

        $response = $this->actingAs($student)->postJson('/api/v1/exams/start', [
            'subject_id' => $maths->id,
            'level_id' => $gcse->id,
            'title' => 'Algebra Practice',
            'question_count' => 5,
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['data' => ['session', 'questions']]);
        $this->assertCount(5, $response->json('data.questions'));
    }

    public function test_student_can_submit_answer(): void
    {
        $this->seedData();
        $student = User::factory()->create(['role' => 'student']);
        $maths = Subject::where('slug', 'maths')->first();
        $gcse = Level::where('slug', 'gcse')->first();

        $startResponse = $this->actingAs($student)->postJson('/api/v1/exams/start', [
            'subject_id' => $maths->id, 'level_id' => $gcse->id, 'title' => 'Test', 'question_count' => 5,
        ]);

        $sessionId = $startResponse->json('data.session.id');
        $questionId = $startResponse->json('data.questions.0.id');

        $response = $this->actingAs($student)->postJson("/api/v1/exams/{$sessionId}/answer", [
            'question_id' => $questionId,
            'answer' => 'A',
        ]);

        $response->assertOk()->assertJsonPath('data.is_correct', true);
    }

    public function test_exam_can_be_completed_with_score(): void
    {
        $this->seedData();
        $student = User::factory()->create(['role' => 'student']);
        $maths = Subject::where('slug', 'maths')->first();
        $gcse = Level::where('slug', 'gcse')->first();

        $startResponse = $this->actingAs($student)->postJson('/api/v1/exams/start', [
            'subject_id' => $maths->id, 'level_id' => $gcse->id, 'title' => 'Test', 'question_count' => 5,
        ]);

        $sessionId = $startResponse->json('data.session.id');

        // Answer all correctly
        foreach ($startResponse->json('data.questions') as $q) {
            $this->actingAs($student)->postJson("/api/v1/exams/{$sessionId}/answer", [
                'question_id' => $q['id'], 'answer' => 'A',
            ]);
        }

        $response = $this->actingAs($student)->postJson("/api/v1/exams/{$sessionId}/complete");

        $response->assertOk()
            ->assertJsonPath('data.score', 100)
            ->assertJsonPath('data.grade_prediction', 'A*');
    }

    public function test_exam_updates_knowledge_map(): void
    {
        $this->seedData();
        $student = User::factory()->create(['role' => 'student']);
        $maths = Subject::where('slug', 'maths')->first();
        $gcse = Level::where('slug', 'gcse')->first();

        $startResponse = $this->actingAs($student)->postJson('/api/v1/exams/start', [
            'subject_id' => $maths->id, 'level_id' => $gcse->id, 'title' => 'Test', 'question_count' => 5,
        ]);

        $sessionId = $startResponse->json('data.session.id');
        foreach ($startResponse->json('data.questions') as $q) {
            $this->actingAs($student)->postJson("/api/v1/exams/{$sessionId}/answer", [
                'question_id' => $q['id'], 'answer' => 'A',
            ]);
        }
        $this->actingAs($student)->postJson("/api/v1/exams/{$sessionId}/complete");

        // Knowledge map should be updated
        $response = $this->actingAs($student)->getJson('/api/v1/knowledge-map');
        $response->assertOk();
        $this->assertNotEmpty($response->json('data'));
    }

    public function test_exam_history(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        ExamSession::create([
            'student_id' => $student->id, 'title' => 'Past Exam',
            'started_at' => now()->subHour(), 'completed_at' => now(), 'score' => 80,
        ]);

        $response = $this->actingAs($student)->getJson('/api/v1/exams/history');
        $response->assertOk();
        $this->assertEquals(1, $response->json('total'));
    }

    // --- Doubt Solver ---
    public function test_student_can_ask_doubt(): void
    {
        $student = User::factory()->create(['role' => 'student']);

        $response = $this->actingAs($student)->postJson('/api/v1/doubts', [
            'question_text' => 'How do I factorise x² + 5x + 6?',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.status', 'ai_answered');
        $this->assertNotNull($response->json('data.ai_answer'));
    }

    public function test_student_can_escalate_doubt(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        $tutor = User::factory()->create(['role' => 'tutor']);

        $doubt = Doubt::create([
            'student_id' => $student->id, 'question_text' => 'Test',
            'ai_answer' => 'AI answer', 'status' => 'ai_answered',
        ]);

        $response = $this->actingAs($student)->postJson("/api/v1/doubts/{$doubt->id}/escalate", [
            'tutor_id' => $tutor->id,
        ]);

        $response->assertOk()->assertJsonPath('data.status', 'escalated');
    }

    public function test_tutor_can_answer_doubt(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        $tutor = User::factory()->create(['role' => 'tutor']);
        TutorProfile::create(['user_id' => $tutor->id]);

        $doubt = Doubt::create([
            'student_id' => $student->id, 'tutor_id' => $tutor->id,
            'question_text' => 'Test', 'status' => 'escalated',
        ]);

        $response = $this->actingAs($tutor)->postJson("/api/v1/tutor/doubts/{$doubt->id}/answer", [
            'tutor_answer' => 'Here is the correct explanation...',
        ]);

        $response->assertOk()->assertJsonPath('data.status', 'tutor_answered');
    }

    // --- Curriculum Topics ---
    public function test_topics_endpoint_returns_curriculum(): void
    {
        $this->seedData();
        $maths = Subject::where('slug', 'maths')->first();
        $gcse = Level::where('slug', 'gcse')->first();

        $response = $this->getJson("/api/v1/topics?subject_id={$maths->id}&level_id={$gcse->id}");
        $response->assertOk();
        $this->assertGreaterThan(0, count($response->json()));
    }

    // --- Questions Bank ---
    public function test_questions_can_be_filtered(): void
    {
        $this->seedData();
        $maths = Subject::where('slug', 'maths')->first();

        $student = User::factory()->create(['role' => 'student']);

        $response = $this->actingAs($student)->getJson("/api/v1/questions?subject_id={$maths->id}&difficulty=easy");
        $response->assertOk();
        $this->assertEquals(10, $response->json('total'));
    }
}
