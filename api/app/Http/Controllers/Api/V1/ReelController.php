<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Reel;
use App\Models\ReelLike;
use App\Models\ReelSave;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReelController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Reel::with(['tutor:id,name,avatar', 'subject:id,name']);

        if ($request->has('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }

        $reels = $query->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 12));

        return response()->json($reels);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:200'],
            'description' => ['nullable', 'string', 'max:1000'],
            'video_url' => ['required', 'string', 'max:500'],
            'thumbnail_url' => ['nullable', 'string', 'max:500'],
            'subject_id' => ['nullable', 'exists:subjects,id'],
        ]);

        $reel = Reel::create([
            'tutor_id' => $request->user()->id,
            ...$validated,
        ]);

        $reel->load(['tutor:id,name,avatar', 'subject:id,name']);

        return response()->json(['data' => $reel], 201);
    }

    public function show(int $id): JsonResponse
    {
        $reel = Reel::with(['tutor:id,name,avatar', 'subject:id,name'])->findOrFail($id);
        $reel->increment('views');
        return response()->json(['data' => $reel]);
    }

    public function toggleLike(Request $request, int $id): JsonResponse
    {
        $reel = Reel::findOrFail($id);
        $existing = ReelLike::where('reel_id', $id)->where('user_id', $request->user()->id)->first();

        if ($existing) {
            $existing->delete();
            $reel->decrement('likes_count');
            return response()->json(['liked' => false, 'likes_count' => $reel->fresh()->likes_count]);
        }

        ReelLike::create(['reel_id' => $id, 'user_id' => $request->user()->id]);
        $reel->increment('likes_count');
        return response()->json(['liked' => true, 'likes_count' => $reel->fresh()->likes_count]);
    }

    public function toggleSave(Request $request, int $id): JsonResponse
    {
        $reel = Reel::findOrFail($id);
        $existing = ReelSave::where('reel_id', $id)->where('user_id', $request->user()->id)->first();

        if ($existing) {
            $existing->delete();
            return response()->json(['saved' => false]);
        }

        ReelSave::create(['reel_id' => $id, 'user_id' => $request->user()->id]);
        return response()->json(['saved' => true]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        Reel::where('id', $id)->where('tutor_id', $request->user()->id)->firstOrFail()->delete();
        return response()->json(['message' => 'Reel deleted.']);
    }
}
