<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    /**
     * List conversations (unique contacts with last message).
     */
    public function conversations(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $conversations = Message::where('sender_id', $userId)
            ->orWhere('receiver_id', $userId)
            ->orderByDesc('created_at')
            ->get()
            ->groupBy(fn ($m) => $m->sender_id === $userId ? $m->receiver_id : $m->sender_id)
            ->map(fn ($msgs, $contactId) => [
                'contact_id' => (int) $contactId,
                'contact_name' => $msgs->first()->sender_id === $userId
                    ? $msgs->first()->receiver->name
                    : $msgs->first()->sender->name,
                'last_message' => $msgs->first()->body,
                'last_at' => $msgs->first()->created_at,
                'unread' => $msgs->where('receiver_id', $userId)->whereNull('read_at')->count(),
            ])
            ->values();

        return response()->json(['data' => $conversations]);
    }

    /**
     * Get message thread with a specific user.
     */
    public function thread(Request $request, int $contactId): JsonResponse
    {
        $userId = $request->user()->id;

        $messages = Message::where(function ($q) use ($userId, $contactId) {
            $q->where('sender_id', $userId)->where('receiver_id', $contactId);
        })->orWhere(function ($q) use ($userId, $contactId) {
            $q->where('sender_id', $contactId)->where('receiver_id', $userId);
        })
            ->with(['sender:id,name,avatar', 'receiver:id,name,avatar'])
            ->orderBy('created_at')
            ->paginate(50);

        // Mark as read
        Message::where('sender_id', $contactId)
            ->where('receiver_id', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json($messages);
    }

    /**
     * Send a message.
     */
    public function send(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'receiver_id' => ['required', 'exists:users,id'],
            'body' => ['required', 'string', 'max:2000'],
            'media_url' => ['nullable', 'string', 'max:500'],
        ]);

        if ($validated['receiver_id'] == $request->user()->id) {
            return response()->json(['message' => 'Cannot message yourself.'], 422);
        }

        $message = Message::create([
            'sender_id' => $request->user()->id,
            ...$validated,
        ]);

        $message->load(['sender:id,name,avatar', 'receiver:id,name,avatar']);

        return response()->json(['data' => $message], 201);
    }
}
