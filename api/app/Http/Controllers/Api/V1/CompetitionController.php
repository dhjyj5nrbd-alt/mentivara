<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Competition;
use App\Models\CompetitionEntry;
use App\Models\XpLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CompetitionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $competitions = Competition::with('tutor:id,name,avatar')
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($competitions);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:200'],
            'description' => ['nullable', 'string', 'max:2000'],
            'reel_id' => ['nullable', 'exists:reels,id'],
            'xp_reward' => ['integer', 'min:10', 'max:500'],
            'deadline' => ['nullable', 'date', 'after:now'],
        ]);

        $competition = Competition::create([
            'tutor_id' => $request->user()->id,
            ...$validated,
        ]);

        return response()->json(['data' => $competition], 201);
    }

    public function enter(Request $request, int $id): JsonResponse
    {
        $competition = Competition::findOrFail($id);

        if ($competition->deadline && $competition->deadline->isPast()) {
            return response()->json(['message' => 'Competition has ended.'], 422);
        }

        $existing = CompetitionEntry::where('competition_id', $id)
            ->where('student_id', $request->user()->id)->exists();

        if ($existing) {
            return response()->json(['message' => 'Already entered.'], 409);
        }

        $validated = $request->validate([
            'answer' => ['required', 'string', 'max:2000'],
        ]);

        $entry = CompetitionEntry::create([
            'competition_id' => $id,
            'student_id' => $request->user()->id,
            'answer' => $validated['answer'],
        ]);

        return response()->json(['data' => $entry], 201);
    }

    public function markCorrect(Request $request, int $entryId): JsonResponse
    {
        $entry = CompetitionEntry::with('competition')->findOrFail($entryId);

        if ($entry->competition->tutor_id !== $request->user()->id) {
            return response()->json(['message' => 'Only the competition creator can judge entries.'], 403);
        }

        $entry->update(['is_correct' => true]);

        // Award XP
        XpLog::create([
            'user_id' => $entry->student_id,
            'amount' => $entry->competition->xp_reward,
            'source_type' => 'competition',
            'source_id' => $entry->competition_id,
            'description' => "Won competition: {$entry->competition->title}",
        ]);

        return response()->json(['data' => $entry]);
    }

    public function leaderboard(): JsonResponse
    {
        $leaders = XpLog::selectRaw('user_id, SUM(amount) as total_xp')
            ->groupBy('user_id')
            ->orderByDesc('total_xp')
            ->limit(20)
            ->with('user:id,name,avatar')
            ->get()
            ->map(fn ($entry) => [
                'user_id' => $entry->user_id,
                'name' => $entry->user->name,
                'avatar' => $entry->user->avatar,
                'total_xp' => $entry->total_xp,
            ]);

        return response()->json(['data' => $leaders]);
    }
}
