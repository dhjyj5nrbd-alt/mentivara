<?php

use App\Http\Controllers\Api\V1\AdminController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\AvailabilityController;
use App\Http\Controllers\Api\V1\BookingController;
use App\Http\Controllers\Api\V1\ClassroomController;
use App\Http\Controllers\Api\V1\LessonController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\TutorDirectoryController;
use App\Http\Controllers\Api\V1\TutorProfileController;
use App\Models\ExamBoard;
use App\Models\Level;
use App\Models\Subject;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Health check
    Route::get('/health', function () {
        return response()->json([
            'status' => 'ok',
            'app' => 'Mentivara API',
            'version' => '0.0.1',
        ]);
    });

    // Public auth routes
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    // Public curriculum reference data
    Route::get('/subjects', fn () => Subject::all());
    Route::get('/levels', fn () => Level::all());
    Route::get('/exam-boards', fn () => ExamBoard::all());

    // Public tutor directory
    Route::get('/tutors', [TutorDirectoryController::class, 'index']);
    Route::get('/tutors/{id}', [TutorDirectoryController::class, 'show']);
    Route::get('/tutors/{id}/availability', [AvailabilityController::class, 'forTutor']);

    // Authenticated routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);

        // Lessons (shared by tutors and students)
        Route::get('/lessons/upcoming', [LessonController::class, 'upcoming']);
        Route::get('/lessons/past', [LessonController::class, 'past']);
        Route::get('/lessons/calendar', [LessonController::class, 'calendar']);
        Route::get('/lessons/{id}', [LessonController::class, 'show']);
        Route::post('/lessons/{id}/cancel', [BookingController::class, 'cancel']);

        // Payments (shared)
        Route::get('/payments', [PaymentController::class, 'history']);
        Route::get('/payments/{id}', [PaymentController::class, 'show']);
        Route::post('/payments/checkout', [PaymentController::class, 'createCheckout']);
        Route::post('/payments/{id}/confirm', [PaymentController::class, 'confirmPayment']);

        // Live classroom
        Route::prefix('classroom/{lessonId}')->group(function () {
            Route::get('/join', [ClassroomController::class, 'join']);
            Route::post('/end', [ClassroomController::class, 'end']);
            Route::post('/messages', [ClassroomController::class, 'sendMessage']);
            Route::get('/messages/poll', [ClassroomController::class, 'pollMessages']);
            Route::post('/whiteboard/strokes', [ClassroomController::class, 'addStroke']);
            Route::get('/whiteboard/strokes/poll', [ClassroomController::class, 'pollStrokes']);
            Route::delete('/whiteboard', [ClassroomController::class, 'clearWhiteboard']);
            Route::post('/signal', [ClassroomController::class, 'sendSignal']);
            Route::get('/signal/poll', [ClassroomController::class, 'pollSignals']);
        });

        // Admin-only routes
        Route::middleware('role:admin')->prefix('admin')->group(function () {
            Route::get('/dashboard', [AdminController::class, 'dashboard']);
            Route::get('/users', [AdminController::class, 'users']);
            Route::get('/users/{id}', [AdminController::class, 'showUser']);
            Route::patch('/users/{id}/status', [AdminController::class, 'updateUserStatus']);
            Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);
            Route::get('/tutors/pending', [AdminController::class, 'pendingTutors']);
            Route::post('/tutors/{id}/approve', [AdminController::class, 'approveTutor']);
            Route::post('/tutors/{id}/reject', [AdminController::class, 'rejectTutor']);
            Route::get('/payments', [PaymentController::class, 'adminPayments']);
            Route::post('/payments/{id}/refund', [PaymentController::class, 'refund']);
        });

        // Tutor-only routes
        Route::middleware('role:tutor')->prefix('tutor')->group(function () {
            Route::get('/profile', [TutorProfileController::class, 'show']);
            Route::put('/profile', [TutorProfileController::class, 'update']);
            Route::post('/profile/subjects', [TutorProfileController::class, 'addSubject']);
            Route::delete('/profile/subjects/{tutorSubjectId}', [TutorProfileController::class, 'removeSubject']);

            // Availability management
            Route::get('/availability', [AvailabilityController::class, 'index']);
            Route::post('/availability', [AvailabilityController::class, 'store']);
            Route::delete('/availability/{id}', [AvailabilityController::class, 'destroy']);
        });

        // Student-only routes
        Route::middleware('role:student')->prefix('student')->group(function () {
            Route::post('/book', [BookingController::class, 'store']);
        });

        // Parent-only routes
        Route::middleware('role:parent')->prefix('parent')->group(function () {
            // Dashboard — will be added next
        });
    });
});
