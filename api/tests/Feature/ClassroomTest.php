<?php

namespace Tests\Feature;

use App\Models\Lesson;
use App\Models\TutorProfile;
use App\Models\User;
use App\Models\WhiteboardStroke;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClassroomTest extends TestCase
{
    use RefreshDatabase;

    private function createLessonWithParticipants(string $status = 'scheduled'): array
    {
        $tutor = User::factory()->create(['role' => 'tutor', 'status' => 'active']);
        TutorProfile::create(['user_id' => $tutor->id, 'verified' => true]);
        $student = User::factory()->create(['role' => 'student', 'status' => 'active']);

        $lesson = Lesson::create([
            'tutor_id' => $tutor->id,
            'student_id' => $student->id,
            'scheduled_at' => Carbon::now()->addHour(),
            'duration_minutes' => 60,
            'status' => $status,
        ]);

        return [$tutor, $student, $lesson];
    }

    public function test_participant_can_join_classroom(): void
    {
        [$tutor, $student, $lesson] = $this->createLessonWithParticipants();

        $response = $this->actingAs($tutor)->getJson("/api/v1/classroom/{$lesson->id}/join");

        $response->assertOk()
            ->assertJsonStructure(['lesson', 'messages', 'strokes', 'user_id', 'role', 'peer_id'])
            ->assertJsonPath('role', 'tutor')
            ->assertJsonPath('peer_id', $student->id);
    }

    public function test_joining_starts_lesson(): void
    {
        [$tutor, , $lesson] = $this->createLessonWithParticipants();

        $this->actingAs($tutor)->getJson("/api/v1/classroom/{$lesson->id}/join");

        $this->assertEquals('in_progress', $lesson->fresh()->status);
    }

    public function test_non_participant_cannot_join(): void
    {
        [, , $lesson] = $this->createLessonWithParticipants();
        $outsider = User::factory()->create(['role' => 'student']);

        $this->actingAs($outsider)->getJson("/api/v1/classroom/{$lesson->id}/join")
            ->assertStatus(404);
    }

    public function test_cannot_join_cancelled_lesson(): void
    {
        [$tutor, , $lesson] = $this->createLessonWithParticipants('cancelled');

        $this->actingAs($tutor)->getJson("/api/v1/classroom/{$lesson->id}/join")
            ->assertStatus(422);
    }

    public function test_participant_can_send_message(): void
    {
        [$tutor, , $lesson] = $this->createLessonWithParticipants('in_progress');

        $response = $this->actingAs($tutor)->postJson("/api/v1/classroom/{$lesson->id}/messages", [
            'body' => 'Hello student!',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.body', 'Hello student!');

        $this->assertDatabaseCount('chat_messages', 1);
    }

    public function test_participant_can_poll_messages(): void
    {
        [$tutor, $student, $lesson] = $this->createLessonWithParticipants('in_progress');

        // Send two messages
        $this->actingAs($tutor)->postJson("/api/v1/classroom/{$lesson->id}/messages", ['body' => 'Msg 1']);
        $this->actingAs($student)->postJson("/api/v1/classroom/{$lesson->id}/messages", ['body' => 'Msg 2']);

        // Poll all
        $response = $this->actingAs($tutor)->getJson("/api/v1/classroom/{$lesson->id}/messages/poll");
        $this->assertCount(2, $response->json('data'));

        // Poll after first message
        $firstId = $response->json('data.0.id');
        $response = $this->actingAs($tutor)->getJson("/api/v1/classroom/{$lesson->id}/messages/poll?after={$firstId}");
        $this->assertCount(1, $response->json('data'));
    }

    public function test_participant_can_add_whiteboard_stroke(): void
    {
        [$tutor, , $lesson] = $this->createLessonWithParticipants('in_progress');

        $response = $this->actingAs($tutor)->postJson("/api/v1/classroom/{$lesson->id}/whiteboard/strokes", [
            'data' => ['tool' => 'pen', 'color' => '#000', 'points' => [[0,0],[10,10],[20,15]]],
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseCount('whiteboard_strokes', 1);
    }

    public function test_tutor_can_clear_whiteboard(): void
    {
        [$tutor, , $lesson] = $this->createLessonWithParticipants('in_progress');

        WhiteboardStroke::create(['lesson_id' => $lesson->id, 'user_id' => $tutor->id, 'data' => ['test' => true]]);

        $this->actingAs($tutor)->deleteJson("/api/v1/classroom/{$lesson->id}/whiteboard")
            ->assertOk();

        $this->assertDatabaseCount('whiteboard_strokes', 0);
    }

    public function test_student_cannot_clear_whiteboard(): void
    {
        [, $student, $lesson] = $this->createLessonWithParticipants('in_progress');

        $this->actingAs($student)->deleteJson("/api/v1/classroom/{$lesson->id}/whiteboard")
            ->assertStatus(403);
    }

    public function test_webrtc_signal_exchange(): void
    {
        [$tutor, $student, $lesson] = $this->createLessonWithParticipants('in_progress');

        // Tutor sends offer
        $this->actingAs($tutor)->postJson("/api/v1/classroom/{$lesson->id}/signal", [
            'to_user_id' => $student->id,
            'type' => 'offer',
            'payload' => ['sdp' => 'mock-sdp-data'],
        ])->assertStatus(201);

        // Student polls and gets the offer
        $response = $this->actingAs($student)->getJson("/api/v1/classroom/{$lesson->id}/signal/poll");
        $this->assertCount(1, $response->json('data'));
        $this->assertEquals('offer', $response->json('data.0.type'));

        // Second poll returns empty (consumed)
        $response = $this->actingAs($student)->getJson("/api/v1/classroom/{$lesson->id}/signal/poll");
        $this->assertCount(0, $response->json('data'));
    }

    public function test_participant_can_end_lesson(): void
    {
        [$tutor, , $lesson] = $this->createLessonWithParticipants('in_progress');

        $this->actingAs($tutor)->postJson("/api/v1/classroom/{$lesson->id}/end")
            ->assertOk();

        $this->assertEquals('completed', $lesson->fresh()->status);
    }
}
