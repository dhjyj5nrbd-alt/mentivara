<?php

namespace Database\Seeders;

use App\Models\CurriculumTopic;
use App\Models\Level;
use App\Models\Question;
use App\Models\Subject;
use Illuminate\Database\Seeder;

class QuestionSeeder extends Seeder
{
    public function run(): void
    {
        $maths = Subject::where('slug', 'maths')->first();
        $gcse = Level::where('slug', 'gcse')->first();
        if (!$maths || !$gcse) return;

        $algebra = CurriculumTopic::where('subject_id', $maths->id)->where('name', 'Algebra')->first();

        $questions = [
            ['content' => 'Solve for x: 2x + 5 = 13', 'correct_answer' => '4', 'type' => 'short_answer', 'difficulty' => 'easy', 'explanation' => '2x = 13 - 5 = 8, so x = 4'],
            ['content' => 'Simplify: 3(x + 2) - 2(x - 1)', 'correct_answer' => 'x + 8', 'type' => 'short_answer', 'difficulty' => 'easy', 'explanation' => '3x + 6 - 2x + 2 = x + 8'],
            ['content' => 'What is the value of x² + 2x when x = 3?', 'correct_answer' => '15', 'type' => 'short_answer', 'difficulty' => 'easy', 'explanation' => '9 + 6 = 15'],
            ['content' => 'Factorise: x² + 5x + 6', 'correct_answer' => '(x+2)(x+3)', 'type' => 'short_answer', 'difficulty' => 'medium', 'explanation' => 'Find two numbers that multiply to 6 and add to 5: 2 and 3'],
            ['content' => 'Solve: x² - 4x - 5 = 0', 'correct_answer' => 'x = 5 or x = -1', 'type' => 'short_answer', 'difficulty' => 'medium', 'explanation' => '(x-5)(x+1) = 0'],
            ['content' => 'Which is a factor of x² - 9?', 'options' => ['(x+3)', '(x+9)', '(x-6)', '(x+1)'], 'correct_answer' => '(x+3)', 'type' => 'mcq', 'difficulty' => 'medium', 'explanation' => 'x² - 9 = (x+3)(x-3) — difference of two squares'],
            ['content' => 'Solve simultaneously: y = 2x + 1 and y = x + 4', 'correct_answer' => 'x = 3, y = 7', 'type' => 'short_answer', 'difficulty' => 'medium', 'explanation' => '2x + 1 = x + 4, so x = 3, y = 7'],
            ['content' => 'Find the nth term of: 3, 7, 11, 15, ...', 'correct_answer' => '4n - 1', 'type' => 'short_answer', 'difficulty' => 'medium', 'explanation' => 'Common difference is 4, first term gives 4(1) - 1 = 3'],
            ['content' => 'Solve for x: (x+2)/(x-1) = 3', 'correct_answer' => 'x = 5/2', 'type' => 'short_answer', 'difficulty' => 'hard', 'explanation' => 'x + 2 = 3(x - 1) = 3x - 3, so 5 = 2x, x = 5/2'],
            ['content' => 'The quadratic formula is used to solve equations of the form ax² + bx + c = 0. What is the discriminant?', 'options' => ['b² - 4ac', 'b² + 4ac', '4ac - b²', '2a'], 'correct_answer' => 'b² - 4ac', 'type' => 'mcq', 'difficulty' => 'hard', 'explanation' => 'The discriminant b² - 4ac determines the nature of the roots'],
        ];

        foreach ($questions as $q) {
            Question::firstOrCreate(
                ['content' => $q['content'], 'subject_id' => $maths->id],
                array_merge($q, [
                    'subject_id' => $maths->id,
                    'level_id' => $gcse->id,
                    'topic_id' => $algebra?->id,
                ])
            );
        }
    }
}
