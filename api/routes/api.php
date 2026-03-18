<?php

use App\Http\Controllers\Api\V1\AdminController;
use App\Http\Controllers\Api\V1\AiCopilotController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\AvailabilityController;
use App\Http\Controllers\Api\V1\BookingController;
use App\Http\Controllers\Api\V1\ClassroomController;
use App\Http\Controllers\Api\V1\CompetitionController;
use App\Http\Controllers\Api\V1\DoubtController;
use App\Http\Controllers\Api\V1\ExamController;
use App\Http\Controllers\Api\V1\ForumController;
use App\Http\Controllers\Api\V1\KnowledgeMapController;
use App\Http\Controllers\Api\V1\LessonController;
use App\Http\Controllers\Api\V1\LessonPackageController;
use App\Http\Controllers\Api\V1\MessageController;
use App\Http\Controllers\Api\V1\MissionController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\ReelController;
use App\Http\Controllers\Api\V1\StudyCoachController;
use App\Http\Controllers\Api\V1\StudyGroupController;
use App\Http\Controllers\Api\V1\StudyScheduleController;
use App\Http\Controllers\Api\V1\MentalDojoController;
use App\Http\Controllers\Api\V1\TutorDirectoryController;
use App\Http\Controllers\Api\V1\TutorProfileController;
use App\Models\CurriculumTopic;
use App\Models\ExamBoard;
use App\Models\Level;
use App\Models\Subject;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('/health', fn () => response()->json(['status' => 'ok', 'app' => 'Mentivara API', 'version' => '0.3.0']));

    // Auth
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    // Public reference data
    Route::get('/subjects', fn () => Subject::all());
    Route::get('/levels', fn () => Level::all());
    Route::get('/exam-boards', fn () => ExamBoard::all());
    Route::get('/topics', function (\Illuminate\Http\Request $request) {
        $query = CurriculumTopic::with('children');
        if ($request->has('subject_id')) $query->where('subject_id', $request->subject_id);
        if ($request->has('level_id')) $query->where('level_id', $request->level_id);
        return $query->whereNull('parent_id')->orderBy('order')->get();
    });

    // Public directory
    Route::get('/tutors', [TutorDirectoryController::class, 'index']);
    Route::get('/tutors/{id}', [TutorDirectoryController::class, 'show']);
    Route::get('/tutors/{id}/availability', [AvailabilityController::class, 'forTutor']);

    // Public reels + forum categories
    Route::get('/reels', [ReelController::class, 'index']);
    Route::get('/reels/{id}', [ReelController::class, 'show']);
    Route::get('/forum/categories', [ForumController::class, 'categories']);
    Route::get('/forum/categories/{categoryId}/threads', [ForumController::class, 'threads']);
    Route::get('/forum/threads/{id}', [ForumController::class, 'showThread']);
    Route::get('/leaderboard', [CompetitionController::class, 'leaderboard']);

    // Authenticated
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);

        // Lessons
        Route::get('/lessons/upcoming', [LessonController::class, 'upcoming']);
        Route::get('/lessons/past', [LessonController::class, 'past']);
        Route::get('/lessons/calendar', [LessonController::class, 'calendar']);
        Route::get('/lessons/{id}', [LessonController::class, 'show']);
        Route::post('/lessons/{id}/cancel', [BookingController::class, 'cancel']);
        Route::post('/lessons/{lessonId}/package/generate', [LessonPackageController::class, 'generate']);
        Route::get('/lessons/{lessonId}/package', [LessonPackageController::class, 'show']);

        // Payments
        Route::get('/payments', [PaymentController::class, 'history']);
        Route::get('/payments/{id}', [PaymentController::class, 'show']);
        Route::post('/payments/checkout', [PaymentController::class, 'createCheckout']);
        Route::post('/payments/{id}/confirm', [PaymentController::class, 'confirmPayment']);

        // Classroom
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
            Route::post('/copilot', [AiCopilotController::class, 'assist']);
        });

        // Doubts
        Route::post('/doubts', [DoubtController::class, 'ask']);
        Route::get('/doubts', [DoubtController::class, 'index']);
        Route::get('/doubts/{id}', [DoubtController::class, 'show']);
        Route::post('/doubts/{id}/escalate', [DoubtController::class, 'escalate']);

        // Exams
        Route::get('/questions', [ExamController::class, 'questions']);
        Route::post('/exams/start', [ExamController::class, 'startExam']);
        Route::post('/exams/{sessionId}/answer', [ExamController::class, 'submitAnswer']);
        Route::post('/exams/{sessionId}/complete', [ExamController::class, 'completeExam']);
        Route::get('/exams/history', [ExamController::class, 'history']);
        Route::get('/exams/{sessionId}/review', [ExamController::class, 'review']);

        // Knowledge Map
        Route::get('/knowledge-map', [KnowledgeMapController::class, 'index']);
        Route::get('/knowledge-map/weak-topics', [KnowledgeMapController::class, 'weakTopics']);

        // Mental Dojo
        Route::get('/mental-dojo/courses', [MentalDojoController::class, 'courses']);
        Route::get('/mental-dojo/courses/{courseId}/modules', [MentalDojoController::class, 'courseModules']);
        Route::post('/mental-dojo/modules/{moduleId}/complete', [MentalDojoController::class, 'completeModule']);

        // AI Study Coach
        Route::get('/coach/recommendations', [StudyCoachController::class, 'recommendations']);
        Route::post('/coach/generate', [StudyCoachController::class, 'generate']);
        Route::post('/coach/recommendations/{id}/dismiss', [StudyCoachController::class, 'dismiss']);
        Route::get('/coach/stats', [StudyCoachController::class, 'stats']);

        // Study Schedule Optimizer
        Route::get('/schedule/current', [StudyScheduleController::class, 'current']);
        Route::post('/schedule/generate', [StudyScheduleController::class, 'generate']);
        Route::get('/schedule/history', [StudyScheduleController::class, 'history']);

        // Reels (authenticated actions)
        Route::post('/reels/{id}/like', [ReelController::class, 'toggleLike']);
        Route::post('/reels/{id}/save', [ReelController::class, 'toggleSave']);

        // Forum (authenticated actions)
        Route::post('/forum/threads', [ForumController::class, 'createThread']);
        Route::post('/forum/threads/{threadId}/replies', [ForumController::class, 'reply']);
        Route::post('/forum/replies/{replyId}/best', [ForumController::class, 'markBestAnswer']);

        // Competitions
        Route::get('/competitions', [CompetitionController::class, 'index']);
        Route::post('/competitions/{id}/enter', [CompetitionController::class, 'enter']);

        // Messaging
        Route::get('/messages/conversations', [MessageController::class, 'conversations']);
        Route::get('/messages/{contactId}', [MessageController::class, 'thread']);
        Route::post('/messages', [MessageController::class, 'send']);

        // Study Groups
        Route::get('/study-groups', [StudyGroupController::class, 'index']);
        Route::post('/study-groups', [StudyGroupController::class, 'store']);
        Route::post('/study-groups/{id}/join', [StudyGroupController::class, 'join']);
        Route::post('/study-groups/{id}/leave', [StudyGroupController::class, 'leave']);
        Route::get('/study-groups/{id}/messages', [StudyGroupController::class, 'messages']);
        Route::post('/study-groups/{id}/messages', [StudyGroupController::class, 'sendMessage']);

        // Daily Missions + XP
        Route::get('/missions/today', [MissionController::class, 'today']);
        Route::post('/missions/complete-task', [MissionController::class, 'completeTask']);

        // Admin
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

        // Tutor
        Route::middleware('role:tutor')->prefix('tutor')->group(function () {
            Route::get('/profile', [TutorProfileController::class, 'show']);
            Route::put('/profile', [TutorProfileController::class, 'update']);
            Route::post('/profile/subjects', [TutorProfileController::class, 'addSubject']);
            Route::delete('/profile/subjects/{tutorSubjectId}', [TutorProfileController::class, 'removeSubject']);
            Route::get('/availability', [AvailabilityController::class, 'index']);
            Route::post('/availability', [AvailabilityController::class, 'store']);
            Route::delete('/availability/{id}', [AvailabilityController::class, 'destroy']);
            Route::post('/doubts/{id}/answer', [DoubtController::class, 'tutorAnswer']);
            Route::post('/reels', [ReelController::class, 'store']);
            Route::delete('/reels/{id}', [ReelController::class, 'destroy']);
            Route::post('/competitions', [CompetitionController::class, 'store']);
            Route::post('/competitions/entries/{entryId}/correct', [CompetitionController::class, 'markCorrect']);
        });

        // Student
        Route::middleware('role:student')->prefix('student')->group(function () {
            Route::post('/book', [BookingController::class, 'store']);
        });
    });
});
