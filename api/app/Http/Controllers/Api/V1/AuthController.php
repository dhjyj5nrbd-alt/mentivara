<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\ParentProfile;
use App\Models\Student;
use App\Models\TutorProfile;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password,
            'role' => $request->role,
            'status' => $request->role === 'tutor' ? 'pending' : 'active',
        ]);

        $this->createRoleProfile($user);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user->load($this->roleRelation($user)),
            'token' => $token,
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Invalid credentials.',
            ], 401);
        }

        $user = User::where('email', $request->email)->firstOrFail();

        if ($user->status === 'suspended') {
            return response()->json([
                'message' => 'Your account has been suspended.',
            ], 403);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user->load($this->roleRelation($user)),
            'token' => $token,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'user' => $user->load($this->roleRelation($user)),
        ]);
    }

    private function createRoleProfile(User $user): void
    {
        match ($user->role) {
            'tutor' => TutorProfile::create(['user_id' => $user->id]),
            'student' => Student::create(['user_id' => $user->id]),
            'parent' => ParentProfile::create(['user_id' => $user->id]),
            default => null,
        };
    }

    private function roleRelation(User $user): array
    {
        return match ($user->role) {
            'tutor' => ['tutorProfile'],
            'student' => ['studentProfile'],
            'parent' => ['parentProfile.students'],
            default => [],
        };
    }
}
