<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiService
{
    private string $apiKey;
    private string $model;
    private string $baseUrl;

    public function __construct()
    {
        $this->apiKey = config('services.anthropic.api_key', '');
        $this->model = config('services.anthropic.model', 'claude-sonnet-4-20250514');
        $this->baseUrl = 'https://api.anthropic.com/v1';
    }

    /**
     * Send a prompt to Claude and get a text response.
     */
    public function generate(string $systemPrompt, string $userMessage, int $maxTokens = 4096): ?string
    {
        if (empty($this->apiKey)) {
            return $this->generateMock($systemPrompt, $userMessage);
        }

        try {
            $response = Http::withHeaders([
                'x-api-key' => $this->apiKey,
                'anthropic-version' => '2023-06-01',
                'content-type' => 'application/json',
            ])->timeout(60)->post("{$this->baseUrl}/messages", [
                'model' => $this->model,
                'max_tokens' => $maxTokens,
                'system' => $systemPrompt,
                'messages' => [
                    ['role' => 'user', 'content' => $userMessage],
                ],
            ]);

            if ($response->successful()) {
                return $response->json('content.0.text');
            }

            Log::error('AI API error', ['status' => $response->status(), 'body' => $response->body()]);
            return null;
        } catch (\Exception $e) {
            Log::error('AI API exception', ['message' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Generate structured JSON response from Claude.
     */
    public function generateJson(string $systemPrompt, string $userMessage, int $maxTokens = 4096): ?array
    {
        $result = $this->generate(
            $systemPrompt . "\n\nIMPORTANT: Respond with valid JSON only. No markdown, no explanation, just JSON.",
            $userMessage,
            $maxTokens
        );

        if (!$result) return null;

        // Extract JSON from response (handle markdown code blocks)
        $json = $result;
        if (preg_match('/```(?:json)?\s*([\s\S]*?)\s*```/', $result, $matches)) {
            $json = $matches[1];
        }

        $decoded = json_decode(trim($json), true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            Log::warning('AI returned invalid JSON', ['response' => $result]);
            return null;
        }

        return $decoded;
    }

    /**
     * Mock response for development without API key.
     */
    private function generateMock(string $systemPrompt, string $userMessage): string
    {
        if (str_contains($systemPrompt, 'lesson summary') || str_contains($systemPrompt, 'lesson package')) {
            return json_encode([
                'summary' => 'This lesson covered key concepts and practice problems. The student showed good understanding of the fundamentals with some areas for improvement in application.',
                'key_notes' => [
                    'Core concept was introduced and explained with examples',
                    'Practice problems were completed collaboratively',
                    'Key formula/method was demonstrated step by step',
                    'Common mistakes were identified and corrected',
                ],
                'flashcards' => [
                    ['front' => 'What is the key concept covered?', 'back' => 'The main concept involves understanding the relationship between variables and applying the correct method.'],
                    ['front' => 'What is the formula used?', 'back' => 'The formula relates the input to the output through a specific mathematical relationship.'],
                    ['front' => 'What is the common mistake to avoid?', 'back' => 'Remember to check units and apply the operation in the correct order.'],
                ],
                'practice_questions' => [
                    ['question' => 'Apply the method learned today to solve a similar problem.', 'hint' => 'Start by identifying the key variables.'],
                    ['question' => 'Explain in your own words why this concept works.', 'hint' => 'Think about the underlying principles.'],
                    ['question' => 'Create your own example using the technique from today.', 'hint' => 'Use simple numbers to test your understanding.'],
                ],
                'homework' => 'Review the key notes and complete 5 practice problems from the textbook. Focus on the areas where mistakes were made during the lesson.',
            ]);
        }

        if (str_contains($systemPrompt, 'copilot') || str_contains($systemPrompt, 'teaching assistant')) {
            return 'Here is a helpful suggestion based on the lesson context. Consider using a visual diagram to explain this concept, followed by a worked example that the student can follow along with.';
        }

        if (str_contains($systemPrompt, 'doubt') || str_contains($systemPrompt, 'question')) {
            return 'Great question! The answer involves understanding the fundamental principle. Let me break it down step by step: First, identify the key components. Then, apply the relevant method. Finally, verify your answer by checking it against known results.';
        }

        if (str_contains($systemPrompt, 'study coach') || str_contains($systemPrompt, 'recommendations')) {
            return json_encode([
                ['type' => 'focus_area', 'content' => 'Based on your recent performance, focus more time on your weakest topics. Spending just 20 extra minutes per day on these areas will significantly improve your scores.'],
                ['type' => 'study_strategy', 'content' => 'Try the Pomodoro technique: 25 minutes of focused study followed by a 5-minute break. This has been shown to improve retention and reduce burnout.'],
                ['type' => 'encouragement', 'content' => 'You are making great progress! Keep up your study streak and remember that consistency beats intensity when it comes to learning.'],
            ]);
        }

        if (str_contains($systemPrompt, 'study planner') || str_contains($systemPrompt, 'study schedule')) {
            return json_encode([
                ['day' => 'Monday', 'blocks' => [['start' => '16:00', 'end' => '16:45', 'subject' => 'Mathematics', 'topic' => 'Algebra', 'type' => 'study'], ['start' => '16:45', 'end' => '17:00', 'subject' => '', 'topic' => 'Break', 'type' => 'break']]],
                ['day' => 'Tuesday', 'blocks' => [['start' => '16:00', 'end' => '16:45', 'subject' => 'English', 'topic' => 'Reading', 'type' => 'study']]],
                ['day' => 'Wednesday', 'blocks' => [['start' => '16:00', 'end' => '16:45', 'subject' => 'Biology', 'topic' => 'Cell Biology', 'type' => 'study']]],
                ['day' => 'Thursday', 'blocks' => [['start' => '16:00', 'end' => '16:45', 'subject' => 'Chemistry', 'topic' => 'Atomic Structure', 'type' => 'practice']]],
                ['day' => 'Friday', 'blocks' => [['start' => '16:00', 'end' => '16:45', 'subject' => 'Physics', 'topic' => 'Forces', 'type' => 'review']]],
                ['day' => 'Saturday', 'blocks' => [['start' => '10:00', 'end' => '11:30', 'subject' => 'Mathematics', 'topic' => 'Mock Exam', 'type' => 'practice']]],
                ['day' => 'Sunday', 'blocks' => []],
            ]);
        }

        return 'AI response placeholder. Configure ANTHROPIC_API_KEY in .env for real AI responses.';
    }
}
