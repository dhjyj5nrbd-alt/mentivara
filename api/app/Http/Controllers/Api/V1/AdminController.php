<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\TutorProfile;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function dashboard(): JsonResponse
    {
        return response()->json([
            'stats' => [
                'total_users' => User::count(),
                'total_students' => User::where('role', 'student')->count(),
                'total_tutors' => User::where('role', 'tutor')->count(),
                'total_parents' => User::where('role', 'parent')->count(),
                'pending_tutors' => User::where('role', 'tutor')->where('status', 'pending')->count(),
                'total_lessons' => Lesson::count(),
                'completed_lessons' => Lesson::where('status', 'completed')->count(),
                'upcoming_lessons' => Lesson::where('status', 'scheduled')->where('scheduled_at', '>=', now())->count(),
            ],
        ]);
    }

    public function users(Request $request): JsonResponse
    {
        $query = User::query();

        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 20));

        return response()->json($users);
    }

    public function showUser(int $id): JsonResponse
    {
        $user = User::with(['tutorProfile.tutorSubjects.subject', 'tutorProfile.tutorSubjects.level', 'studentProfile', 'parentProfile'])
            ->findOrFail($id);

        return response()->json(['data' => $user]);
    }

    public function updateUserStatus(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:active,pending,suspended'],
        ]);

        $user = User::findOrFail($id);

        // Prevent admin from suspending themselves
        if ($user->id === $request->user()->id && $validated['status'] === 'suspended') {
            return response()->json(['message' => 'You cannot suspend your own account.'], 422);
        }

        $user->update(['status' => $validated['status']]);

        return response()->json([
            'message' => "User status updated to {$validated['status']}.",
            'data' => $user,
        ]);
    }

    public function pendingTutors(): JsonResponse
    {
        $tutors = User::where('role', 'tutor')
            ->where('status', 'pending')
            ->with('tutorProfile')
            ->orderBy('created_at')
            ->get();

        return response()->json(['data' => $tutors]);
    }

    public function approveTutor(int $id): JsonResponse
    {
        $user = User::where('id', $id)
            ->where('role', 'tutor')
            ->where('status', 'pending')
            ->firstOrFail();

        $user->update(['status' => 'active']);
        $user->tutorProfile?->update(['verified' => true]);

        return response()->json([
            'message' => 'Tutor approved and verified.',
            'data' => $user->load('tutorProfile'),
        ]);
    }

    public function rejectTutor(Request $request, int $id): JsonResponse
    {
        $user = User::where('id', $id)
            ->where('role', 'tutor')
            ->where('status', 'pending')
            ->firstOrFail();

        $user->update(['status' => 'suspended']);

        return response()->json([
            'message' => 'Tutor application rejected.',
            'data' => $user,
        ]);
    }

    public function deleteUser(int $id, Request $request): JsonResponse
    {
        $user = User::findOrFail($id);

        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'You cannot delete your own account.'], 422);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted.']);
    }
}
