<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\StudyGroup;
use App\Models\StudyGroupMember;
use App\Models\StudyGroupMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudyGroupController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $groups = StudyGroupMember::where('user_id', $request->user()->id)
            ->with('studyGroup')
            ->get()
            ->pluck('studyGroup');

        return response()->json(['data' => $groups]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:500'],
            'is_private' => ['boolean'],
        ]);

        $group = StudyGroup::create([
            'created_by' => $request->user()->id,
            ...$validated,
        ]);

        StudyGroupMember::create([
            'study_group_id' => $group->id,
            'user_id' => $request->user()->id,
            'role' => 'owner',
        ]);

        return response()->json(['data' => $group], 201);
    }

    public function join(Request $request, int $id): JsonResponse
    {
        $group = StudyGroup::findOrFail($id);

        if ($group->is_private) {
            return response()->json(['message' => 'This group is private. You need an invitation to join.'], 403);
        }

        $existing = StudyGroupMember::where('study_group_id', $id)
            ->where('user_id', $request->user()->id)->exists();

        if ($existing) {
            return response()->json(['message' => 'Already a member.'], 409);
        }

        StudyGroupMember::create([
            'study_group_id' => $id,
            'user_id' => $request->user()->id,
        ]);

        $group->increment('members_count');

        return response()->json(['message' => 'Joined group.']);
    }

    public function leave(Request $request, int $id): JsonResponse
    {
        $member = StudyGroupMember::where('study_group_id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        if ($member->role === 'owner') {
            return response()->json(['message' => 'Owner cannot leave. Delete the group instead.'], 422);
        }

        $member->delete();
        StudyGroup::find($id)?->decrement('members_count');

        return response()->json(['message' => 'Left group.']);
    }

    public function messages(Request $request, int $id): JsonResponse
    {
        // Verify membership
        StudyGroupMember::where('study_group_id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $messages = StudyGroupMessage::where('study_group_id', $id)
            ->with('user:id,name,avatar')
            ->orderByDesc('created_at')
            ->paginate(50);

        return response()->json($messages);
    }

    public function sendMessage(Request $request, int $id): JsonResponse
    {
        StudyGroupMember::where('study_group_id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $validated = $request->validate([
            'body' => ['required', 'string', 'max:2000'],
            'media_url' => ['nullable', 'string', 'max:500'],
        ]);

        $message = StudyGroupMessage::create([
            'study_group_id' => $id,
            'user_id' => $request->user()->id,
            ...$validated,
        ]);

        $message->load('user:id,name,avatar');

        return response()->json(['data' => $message], 201);
    }
}
