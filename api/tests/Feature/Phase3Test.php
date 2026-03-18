<?php

namespace Tests\Feature;

use App\Models\Competition;
use App\Models\ForumCategory;
use App\Models\ForumReply;
use App\Models\ForumThread;
use App\Models\Reel;
use App\Models\StudyGroup;
use App\Models\StudyGroupMember;
use App\Models\TutorProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class Phase3Test extends TestCase
{
    use RefreshDatabase;

    private function tutor(): User
    {
        $u = User::factory()->create(['role' => 'tutor']);
        TutorProfile::create(['user_id' => $u->id, 'verified' => true]);
        return $u;
    }

    private function student(): User
    {
        return User::factory()->create(['role' => 'student']);
    }

    // --- Reels ---
    public function test_tutor_can_create_reel(): void
    {
        $tutor = $this->tutor();
        $response = $this->actingAs($tutor)->postJson('/api/v1/tutor/reels', [
            'title' => 'Quick tip', 'video_url' => 'https://example.com/video.mp4',
        ]);
        $response->assertStatus(201);
        $this->assertDatabaseCount('reels', 1);
    }

    public function test_reels_are_publicly_listable(): void
    {
        $tutor = $this->tutor();
        Reel::create(['tutor_id' => $tutor->id, 'title' => 'Tip', 'video_url' => 'https://example.com/v.mp4']);
        $this->getJson('/api/v1/reels')->assertOk();
    }

    public function test_user_can_like_and_unlike_reel(): void
    {
        $tutor = $this->tutor();
        $reel = Reel::create(['tutor_id' => $tutor->id, 'title' => 'T', 'video_url' => 'https://ex.com/v.mp4']);
        $student = $this->student();

        $r1 = $this->actingAs($student)->postJson("/api/v1/reels/{$reel->id}/like");
        $this->assertTrue($r1->json('liked'));

        $r2 = $this->actingAs($student)->postJson("/api/v1/reels/{$reel->id}/like");
        $this->assertFalse($r2->json('liked'));
    }

    // --- Forum ---
    public function test_forum_categories_listed(): void
    {
        ForumCategory::create(['name' => 'Maths', 'slug' => 'maths']);
        $this->getJson('/api/v1/forum/categories')->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_user_can_create_thread_and_reply(): void
    {
        $cat = ForumCategory::create(['name' => 'Maths', 'slug' => 'maths']);
        $student = $this->student();

        $thread = $this->actingAs($student)->postJson('/api/v1/forum/threads', [
            'category_id' => $cat->id, 'title' => 'Help with algebra', 'body' => 'How do I solve x²?',
        ]);
        $thread->assertStatus(201);

        $reply = $this->actingAs($student)->postJson("/api/v1/forum/threads/{$thread->json('data.id')}/replies", [
            'body' => 'Use the quadratic formula!',
        ]);
        $reply->assertStatus(201);
    }

    public function test_thread_author_can_mark_best_answer(): void
    {
        $cat = ForumCategory::create(['name' => 'Test', 'slug' => 'test']);
        $author = $this->student();
        $thread = ForumThread::create(['category_id' => $cat->id, 'user_id' => $author->id, 'title' => 'Q', 'body' => 'B']);
        $reply = ForumReply::create(['thread_id' => $thread->id, 'user_id' => $author->id, 'body' => 'Answer']);

        $this->actingAs($author)->postJson("/api/v1/forum/replies/{$reply->id}/best")->assertOk();
        $this->assertTrue($reply->fresh()->is_best_answer);
    }

    // --- Study Groups ---
    public function test_student_can_create_and_join_group(): void
    {
        $s1 = $this->student();
        $s2 = $this->student();

        $group = $this->actingAs($s1)->postJson('/api/v1/study-groups', ['name' => 'GCSE Maths Study']);
        $group->assertStatus(201);

        $this->actingAs($s2)->postJson("/api/v1/study-groups/{$group->json('data.id')}/join")->assertOk();
        $this->assertEquals(2, StudyGroup::first()->members_count);
    }

    public function test_group_members_can_message(): void
    {
        $s = $this->student();
        $group = StudyGroup::create(['name' => 'G', 'created_by' => $s->id]);
        StudyGroupMember::create(['study_group_id' => $group->id, 'user_id' => $s->id, 'role' => 'owner']);

        $this->actingAs($s)->postJson("/api/v1/study-groups/{$group->id}/messages", ['body' => 'Hello!'])->assertStatus(201);
        $this->assertDatabaseCount('study_group_messages', 1);
    }

    // --- Messaging ---
    public function test_users_can_send_and_read_messages(): void
    {
        $s = $this->student();
        $t = $this->tutor();

        $this->actingAs($s)->postJson('/api/v1/messages', [
            'receiver_id' => $t->id, 'body' => 'Hi tutor!',
        ])->assertStatus(201);

        $thread = $this->actingAs($t)->getJson("/api/v1/messages/{$s->id}");
        $thread->assertOk();
        $this->assertEquals(1, $thread->json('total'));
    }

    public function test_cannot_message_self(): void
    {
        $s = $this->student();
        $this->actingAs($s)->postJson('/api/v1/messages', [
            'receiver_id' => $s->id, 'body' => 'Self',
        ])->assertStatus(422);
    }

    // --- Competitions ---
    public function test_tutor_can_create_competition(): void
    {
        $t = $this->tutor();
        $this->actingAs($t)->postJson('/api/v1/tutor/competitions', [
            'title' => 'Solve this!', 'xp_reward' => 100,
        ])->assertStatus(201);
    }

    public function test_student_can_enter_competition(): void
    {
        $t = $this->tutor();
        $comp = Competition::create(['tutor_id' => $t->id, 'title' => 'Challenge', 'xp_reward' => 50]);
        $s = $this->student();

        $this->actingAs($s)->postJson("/api/v1/competitions/{$comp->id}/enter", ['answer' => '42'])->assertStatus(201);
        $this->assertDatabaseCount('competition_entries', 1);
    }

    public function test_cannot_enter_competition_twice(): void
    {
        $t = $this->tutor();
        $comp = Competition::create(['tutor_id' => $t->id, 'title' => 'C', 'xp_reward' => 50]);
        $s = $this->student();

        $this->actingAs($s)->postJson("/api/v1/competitions/{$comp->id}/enter", ['answer' => '1']);
        $this->actingAs($s)->postJson("/api/v1/competitions/{$comp->id}/enter", ['answer' => '2'])->assertStatus(409);
    }

    public function test_marking_correct_awards_xp(): void
    {
        $t = $this->tutor();
        $comp = Competition::create(['tutor_id' => $t->id, 'title' => 'C', 'xp_reward' => 100]);
        $s = $this->student();

        $entry = $this->actingAs($s)->postJson("/api/v1/competitions/{$comp->id}/enter", ['answer' => 'A']);
        $this->actingAs($t)->postJson("/api/v1/tutor/competitions/entries/{$entry->json('data.id')}/correct")->assertOk();

        $this->assertDatabaseHas('xp_log', ['user_id' => $s->id, 'amount' => 100]);
    }

    // --- Missions + Streaks ---
    public function test_student_gets_daily_mission(): void
    {
        $s = $this->student();
        $response = $this->actingAs($s)->getJson('/api/v1/missions/today');
        $response->assertOk()
            ->assertJsonStructure(['mission' => ['tasks'], 'streak', 'total_xp']);
    }

    public function test_completing_all_tasks_awards_xp_and_streak(): void
    {
        $s = $this->student();
        $this->actingAs($s)->getJson('/api/v1/missions/today'); // generate

        $mission = \App\Models\StudyMission::where('user_id', $s->id)->first();
        $taskCount = count($mission->tasks);

        for ($i = 0; $i < $taskCount; $i++) {
            $r = $this->actingAs($s)->postJson('/api/v1/missions/complete-task', ['task_index' => $i]);
            $r->assertOk();
        }

        $mission = \App\Models\StudyMission::where('user_id', $s->id)->first();
        // Debug: check tasks state
        $allDone = collect($mission->tasks)->every(fn ($t) => $t['completed'] ?? false);
        $this->assertTrue($allDone, 'Not all tasks completed. Tasks: ' . json_encode($mission->tasks));
        $this->assertTrue((bool) $mission->completed);
        $this->assertEquals(25, $mission->xp_earned);
        $this->assertEquals(1, \App\Models\Streak::where('user_id', $s->id)->first()->current_streak);
    }

    // --- Leaderboard ---
    public function test_leaderboard_returns_data(): void
    {
        $this->getJson('/api/v1/leaderboard')->assertOk();
    }
}
