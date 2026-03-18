<?php

namespace Tests\Feature;

use App\Models\Lesson;
use App\Models\Payment;
use App\Models\TutorProfile;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentTest extends TestCase
{
    use RefreshDatabase;

    private function createLessonPair(): array
    {
        $tutor = User::factory()->create(['role' => 'tutor', 'status' => 'active']);
        TutorProfile::create(['user_id' => $tutor->id, 'verified' => true, 'hourly_rate' => 4000]); // £40/hr
        $student = User::factory()->create(['role' => 'student', 'status' => 'active']);

        $lesson = Lesson::create([
            'tutor_id' => $tutor->id,
            'student_id' => $student->id,
            'scheduled_at' => Carbon::now()->addDays(3),
            'duration_minutes' => 60,
            'status' => 'scheduled',
        ]);

        return [$tutor, $student, $lesson];
    }

    public function test_student_can_create_checkout(): void
    {
        [$tutor, $student, $lesson] = $this->createLessonPair();

        $response = $this->actingAs($student)->postJson('/api/v1/payments/checkout', [
            'lesson_id' => $lesson->id,
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['data' => ['payment_id', 'amount', 'currency', 'status']]);

        $this->assertEquals('40.00', $response->json('data.amount')); // £40 for 60min at £40/hr
        $this->assertDatabaseCount('payments', 1);
    }

    public function test_checkout_calculates_price_by_duration(): void
    {
        $tutor = User::factory()->create(['role' => 'tutor', 'status' => 'active']);
        TutorProfile::create(['user_id' => $tutor->id, 'verified' => true, 'hourly_rate' => 6000]); // £60/hr
        $student = User::factory()->create(['role' => 'student']);

        $lesson = Lesson::create([
            'tutor_id' => $tutor->id,
            'student_id' => $student->id,
            'scheduled_at' => Carbon::now()->addDays(3),
            'duration_minutes' => 30,
            'status' => 'scheduled',
        ]);

        $response = $this->actingAs($student)->postJson('/api/v1/payments/checkout', [
            'lesson_id' => $lesson->id,
        ]);

        $this->assertEquals('30.00', $response->json('data.amount')); // £30 for 30min at £60/hr
    }

    public function test_cannot_pay_for_already_paid_lesson(): void
    {
        [$tutor, $student, $lesson] = $this->createLessonPair();

        Payment::create([
            'student_id' => $student->id,
            'tutor_id' => $tutor->id,
            'lesson_id' => $lesson->id,
            'amount' => 4000,
            'status' => 'completed',
        ]);

        $this->actingAs($student)->postJson('/api/v1/payments/checkout', [
            'lesson_id' => $lesson->id,
        ])->assertStatus(409);
    }

    public function test_student_can_confirm_payment(): void
    {
        [$tutor, $student, $lesson] = $this->createLessonPair();

        $payment = Payment::create([
            'student_id' => $student->id,
            'tutor_id' => $tutor->id,
            'lesson_id' => $lesson->id,
            'amount' => 4000,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($student)->postJson("/api/v1/payments/{$payment->id}/confirm");

        $response->assertOk();
        $this->assertEquals('completed', $payment->fresh()->status);
        $this->assertNotNull($payment->fresh()->stripe_payment_intent_id);
    }

    public function test_student_can_view_payment_history(): void
    {
        [$tutor, $student, $lesson] = $this->createLessonPair();

        Payment::create([
            'student_id' => $student->id,
            'tutor_id' => $tutor->id,
            'lesson_id' => $lesson->id,
            'amount' => 4000,
            'status' => 'completed',
        ]);

        $response = $this->actingAs($student)->getJson('/api/v1/payments');
        $response->assertOk();
        $this->assertEquals(1, $response->json('total'));
    }

    public function test_tutor_can_view_their_earnings(): void
    {
        [$tutor, $student, $lesson] = $this->createLessonPair();

        Payment::create([
            'student_id' => $student->id,
            'tutor_id' => $tutor->id,
            'lesson_id' => $lesson->id,
            'amount' => 4000,
            'status' => 'completed',
        ]);

        $response = $this->actingAs($tutor)->getJson('/api/v1/payments');
        $response->assertOk();
        $this->assertEquals(1, $response->json('total'));
    }

    public function test_admin_can_view_all_payments_with_stats(): void
    {
        [$tutor, $student, $lesson] = $this->createLessonPair();
        $admin = User::factory()->create(['role' => 'admin']);

        Payment::create([
            'student_id' => $student->id,
            'tutor_id' => $tutor->id,
            'lesson_id' => $lesson->id,
            'amount' => 4000,
            'status' => 'completed',
        ]);

        $response = $this->actingAs($admin)->getJson('/api/v1/admin/payments');
        $response->assertOk()
            ->assertJsonStructure(['stats' => ['total_revenue', 'total_payments']]);
        $this->assertEquals(4000, $response->json('stats.total_revenue'));
    }

    public function test_admin_can_refund_payment(): void
    {
        [$tutor, $student, $lesson] = $this->createLessonPair();
        $admin = User::factory()->create(['role' => 'admin']);

        $payment = Payment::create([
            'student_id' => $student->id,
            'tutor_id' => $tutor->id,
            'lesson_id' => $lesson->id,
            'amount' => 4000,
            'status' => 'completed',
        ]);

        $response = $this->actingAs($admin)->postJson("/api/v1/admin/payments/{$payment->id}/refund");

        $response->assertOk();
        $this->assertEquals('refunded', $payment->fresh()->status);
    }

    public function test_user_can_view_single_payment(): void
    {
        [$tutor, $student, $lesson] = $this->createLessonPair();

        $payment = Payment::create([
            'student_id' => $student->id,
            'tutor_id' => $tutor->id,
            'lesson_id' => $lesson->id,
            'amount' => 4000,
            'status' => 'completed',
        ]);

        $response = $this->actingAs($student)->getJson("/api/v1/payments/{$payment->id}");
        $response->assertOk()
            ->assertJsonPath('data.id', $payment->id);
    }

    public function test_user_cannot_view_others_payment(): void
    {
        [$tutor, $student, $lesson] = $this->createLessonPair();
        $otherStudent = User::factory()->create(['role' => 'student']);

        $payment = Payment::create([
            'student_id' => $student->id,
            'tutor_id' => $tutor->id,
            'lesson_id' => $lesson->id,
            'amount' => 4000,
            'status' => 'completed',
        ]);

        $this->actingAs($otherStudent)->getJson("/api/v1/payments/{$payment->id}")
            ->assertStatus(404);
    }
}
