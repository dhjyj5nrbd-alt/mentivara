<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ForumCategory;
use App\Models\ForumReply;
use App\Models\ForumThread;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ForumController extends Controller
{
    public function categories(): JsonResponse
    {
        return response()->json(['data' => ForumCategory::orderBy('order')->get()]);
    }

    public function threads(Request $request, int $categoryId): JsonResponse
    {
        $threads = ForumThread::where('category_id', $categoryId)
            ->with('user:id,name,avatar')
            ->orderByDesc('pinned')
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($threads);
    }

    public function showThread(int $id): JsonResponse
    {
        $thread = ForumThread::with(['user:id,name,avatar', 'category', 'replies.user:id,name,avatar'])
            ->findOrFail($id);
        return response()->json(['data' => $thread]);
    }

    public function createThread(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => ['required', 'exists:forum_categories,id'],
            'title' => ['required', 'string', 'max:200'],
            'body' => ['required', 'string', 'max:5000'],
        ]);

        $thread = ForumThread::create([
            'user_id' => $request->user()->id,
            ...$validated,
        ]);

        $thread->load('user:id,name,avatar');

        return response()->json(['data' => $thread], 201);
    }

    public function reply(Request $request, int $threadId): JsonResponse
    {
        $thread = ForumThread::findOrFail($threadId);

        if ($thread->locked) {
            return response()->json(['message' => 'This thread is locked.'], 422);
        }

        $validated = $request->validate([
            'body' => ['required', 'string', 'max:5000'],
        ]);

        $reply = ForumReply::create([
            'thread_id' => $threadId,
            'user_id' => $request->user()->id,
            'body' => $validated['body'],
        ]);

        $thread->increment('replies_count');
        $reply->load('user:id,name,avatar');

        return response()->json(['data' => $reply], 201);
    }

    public function markBestAnswer(Request $request, int $replyId): JsonResponse
    {
        $reply = ForumReply::with('thread')->findOrFail($replyId);

        if ($reply->thread->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Only the thread author can mark best answer.'], 403);
        }

        // Unmark previous best
        ForumReply::where('thread_id', $reply->thread_id)->update(['is_best_answer' => false]);
        $reply->update(['is_best_answer' => true]);

        return response()->json(['data' => $reply]);
    }
}
