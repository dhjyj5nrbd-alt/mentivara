<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\KnowledgeMapEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KnowledgeMapController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $entries = KnowledgeMapEntry::where('student_id', $request->user()->id)
            ->with('topic.subject', 'topic.level')
            ->orderByDesc('last_assessed_at')
            ->get()
            ->map(fn ($e) => [
                'topic_id' => $e->topic_id,
                'topic_name' => $e->topic->name,
                'subject' => $e->topic->subject->name,
                'level' => $e->topic->level->name,
                'mastery_pct' => $e->mastery_pct,
                'questions_attempted' => $e->questions_attempted,
                'questions_correct' => $e->questions_correct,
                'last_assessed_at' => $e->last_assessed_at,
            ]);

        // Group by subject
        $grouped = $entries->groupBy('subject');

        return response()->json(['data' => $grouped]);
    }

    /**
     * Get weak topics (below 50% mastery).
     */
    public function weakTopics(Request $request): JsonResponse
    {
        $entries = KnowledgeMapEntry::where('student_id', $request->user()->id)
            ->where('mastery_pct', '<', 50)
            ->where('questions_attempted', '>=', 3)
            ->with('topic.subject')
            ->orderBy('mastery_pct')
            ->limit(10)
            ->get();

        return response()->json(['data' => $entries]);
    }
}
