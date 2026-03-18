<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\Payment;
use App\Models\TutorProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    /**
     * Create a payment for a lesson booking.
     * In production this would create a Stripe Checkout Session.
     * For now, we simulate the payment flow with API-driven status updates.
     */
    public function createCheckout(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'lesson_id' => ['required', 'exists:lessons,id'],
        ]);

        $user = $request->user();
        $lesson = Lesson::where('id', $validated['lesson_id'])
            ->where('student_id', $user->id)
            ->firstOrFail();

        // Check if already paid
        $existingPayment = Payment::where('lesson_id', $lesson->id)
            ->where('status', 'completed')
            ->exists();

        if ($existingPayment) {
            return response()->json(['message' => 'Lesson already paid for.'], 409);
        }

        $tutorProfile = TutorProfile::where('user_id', $lesson->tutor_id)->first();
        $hourlyRate = $tutorProfile?->hourly_rate ?? 3000; // default £30/hr
        $amount = (int) round($hourlyRate * ($lesson->duration_minutes / 60));

        $payment = Payment::create([
            'student_id' => $user->id,
            'tutor_id' => $lesson->tutor_id,
            'lesson_id' => $lesson->id,
            'amount' => $amount,
            'currency' => 'gbp',
            'status' => 'pending',
            'description' => "Lesson with tutor #{$lesson->tutor_id} on " . $lesson->scheduled_at->format('d M Y H:i'),
        ]);

        // In production: create Stripe Checkout Session here
        // $session = \Stripe\Checkout\Session::create([...])
        // $payment->update(['stripe_checkout_session_id' => $session->id])

        return response()->json([
            'data' => [
                'payment_id' => $payment->id,
                'amount' => $payment->formatted_amount,
                'currency' => $payment->currency,
                'status' => $payment->status,
                // 'checkout_url' => $session->url, // Stripe URL in production
            ],
        ], 201);
    }

    /**
     * Simulate payment completion (replaces Stripe webhook in dev).
     * In production, this would be POST /webhook/stripe.
     */
    public function confirmPayment(Request $request, int $paymentId): JsonResponse
    {
        $payment = Payment::where('id', $paymentId)
            ->where('student_id', $request->user()->id)
            ->where('status', 'pending')
            ->firstOrFail();

        $payment->update([
            'status' => 'completed',
            'stripe_payment_intent_id' => 'pi_simulated_' . uniqid(),
        ]);

        return response()->json([
            'message' => 'Payment confirmed.',
            'data' => $payment,
        ]);
    }

    /**
     * Get payment history for the authenticated user.
     */
    public function history(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Payment::with(['lesson.subject', 'student:id,name', 'tutor:id,name']);

        if ($user->role === 'student') {
            $query->where('student_id', $user->id);
        } elseif ($user->role === 'tutor') {
            $query->where('tutor_id', $user->id);
        }

        $payments = $query->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 20));

        return response()->json($payments);
    }

    /**
     * Get a single payment.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $payment = Payment::with(['lesson', 'student:id,name', 'tutor:id,name'])
            ->where('id', $id)
            ->where(function ($q) use ($user) {
                $q->where('student_id', $user->id)
                    ->orWhere('tutor_id', $user->id);
            })
            ->firstOrFail();

        return response()->json(['data' => $payment]);
    }

    /**
     * Refund a payment (admin only).
     */
    public function refund(Request $request, int $id): JsonResponse
    {
        $payment = Payment::where('id', $id)
            ->where('status', 'completed')
            ->firstOrFail();

        // In production: Stripe refund here
        $payment->update(['status' => 'refunded']);

        return response()->json([
            'message' => 'Payment refunded.',
            'data' => $payment,
        ]);
    }

    /**
     * Admin: view all payments with stats.
     */
    public function adminPayments(Request $request): JsonResponse
    {
        $payments = Payment::with(['student:id,name', 'tutor:id,name', 'lesson'])
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 20));

        $stats = [
            'total_revenue' => Payment::where('status', 'completed')->sum('amount'),
            'total_payments' => Payment::where('status', 'completed')->count(),
            'pending_payments' => Payment::where('status', 'pending')->count(),
            'refunded_total' => Payment::where('status', 'refunded')->sum('amount'),
        ];

        return response()->json([
            'stats' => $stats,
            'payments' => $payments,
        ]);
    }
}
