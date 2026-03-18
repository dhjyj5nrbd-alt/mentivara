<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MessageController extends Controller
{
    /**
     * List conversations (unique contacts with last message).
     * Uses SQL-level aggregation instead of loading all messages into memory.
     */
    public function conversations(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        // Get unique contact IDs with their latest message ID
        $sent = Message::where('sender_id', $userId)
            ->selectRaw('receiver_id as contact_id, MAX(id) as last_message_id')
            ->groupBy('receiver_id');

        $received = Message::where('receiver_id', $userId)
            ->selectRaw('sender_id as contact_id, MAX(id) as last_message_id')
            ->groupBy('sender_id');

        // Union and get the latest message per contact
        $contactMessages = DB::query()
            ->fromSub(
                $sent->unionAll($received),
                'combined'
            )
            ->selectRaw('contact_id, MAX(last_message_id) as last_message_id')
            ->groupBy('contact_id')
            ->orderByDesc('last_message_id')
            ->get();

        $conversations = $contactMessages->map(function ($row) use ($userId) {
            $message = Message::find($row->last_message_id);
            $contact = User::find($row->contact_id);

            if (!$message || !$contact) return null;

            $unread = Message::where('sender_id', $row->contact_id)
                ->where('receiver_id', $userId)
                ->whereNull('read_at')
                ->count();

            return [
                'contact_id' => (int) $row->contact_id,
                'contact_name' => $contact->name,
                'contact_avatar' => $contact->avatar,
                'last_message' => $message->body,
                'last_at' => $message->created_at,
                'unread' => $unread,
            ];
        })->filter()->values();

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

        if ((int) $validated['receiver_id'] === $request->user()->id) {
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
