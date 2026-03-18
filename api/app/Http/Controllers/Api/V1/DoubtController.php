<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Doubt;
use App\Services\AiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DoubtController extends Controller
{
    public function __construct(private AiService $ai) {}

    /**
     * Student asks a question — AI answers immediately.
     */
    public function ask(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'question_text' => ['required', 'string', 'max:2000'],
            'subject_id' => ['nullable', 'exists:subjects,id'],
            'image_url' => ['nullable', 'string', 'max:500'],
        ]);

        $doubt = Doubt::create([
            'student_id' => $request->user()->id,
            'question_text' => $validated['question_text'],
            'subject_id' => $validated['subject_id'] ?? null,
            'image_url' => $validated['image_url'] ?? null,
            'status' => 'pending',
        ]);

        // Generate AI answer
        $aiAnswer = $this->ai->generate(
            "You are a helpful tutor for UK students. Answer the question clearly and step by step. If the question involves an image, do your best based on the text description.",
            $doubt->question_text
        );

        $doubt->update([
            'ai_answer' => $aiAnswer,
            'status' => 'ai_answered',
        ]);

        return response()->json(['data' => $doubt], 201);
    }

    /**
     * Student escalates doubt to their tutor.
     */
    public function escalate(Request $request, int $doubtId): JsonResponse
    {
        $validated = $request->validate([
            'tutor_id' => ['required', 'exists:users,id'],
        ]);

        $doubt = Doubt::where('id', $doubtId)
            ->where('student_id', $request->user()->id)
            ->firstOrFail();

        $doubt->update([
            'tutor_id' => $validated['tutor_id'],
            'status' => 'escalated',
        ]);

        return response()->json(['data' => $doubt]);
    }

    /**
     * Tutor answers an escalated doubt.
     */
    public function tutorAnswer(Request $request, int $doubtId): JsonResponse
    {
        $validated = $request->validate([
            'tutor_answer' => ['required', 'string', 'max:5000'],
            'tutor_media_url' => ['nullable', 'string', 'max:500'],
        ]);

        $doubt = Doubt::where('id', $doubtId)
            ->where('tutor_id', $request->user()->id)
            ->where('status', 'escalated')
            ->firstOrFail();

        $doubt->update([
            'tutor_answer' => $validated['tutor_answer'],
            'tutor_media_url' => $validated['tutor_media_url'] ?? null,
            'status' => 'tutor_answered',
        ]);

        return response()->json(['data' => $doubt]);
    }

    /**
     * List doubts for the current user.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Doubt::with(['subject', 'student:id,name', 'tutor:id,name']);

        if ($user->role === 'student') {
            $query->where('student_id', $user->id);
        } elseif ($user->role === 'tutor') {
            $query->where('tutor_id', $user->id);
        }

        $doubts = $query->orderByDesc('created_at')->paginate(20);

        return response()->json($doubts);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $doubt = Doubt::with(['subject', 'student:id,name', 'tutor:id,name'])
            ->where('id', $id)
            ->where(function ($q) use ($user) {
                $q->where('student_id', $user->id)->orWhere('tutor_id', $user->id);
            })
            ->firstOrFail();

        return response()->json(['data' => $doubt]);
    }
}
