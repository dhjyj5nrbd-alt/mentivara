<?php

use App\Http\Controllers\Api\V1\AuthController;
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

    // Authenticated routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);

        // Admin-only routes
        Route::middleware('role:admin')->prefix('admin')->group(function () {
            Route::get('/', function () {
                return response()->json(['message' => 'Admin area']);
            });
            // Tutor approval, user management — will be added next
        });

        // Tutor-only routes
        Route::middleware('role:tutor')->prefix('tutor')->group(function () {
            // Profile management, availability — will be added next
        });

        // Student-only routes
        Route::middleware('role:student')->prefix('student')->group(function () {
            // Bookings, study tools — will be added next
        });

        // Parent-only routes
        Route::middleware('role:parent')->prefix('parent')->group(function () {
            // Dashboard — will be added next
        });
    });
});
