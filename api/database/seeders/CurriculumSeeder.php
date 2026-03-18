<?php

namespace Database\Seeders;

use App\Models\ExamBoard;
use App\Models\Level;
use App\Models\Subject;
use Illuminate\Database\Seeder;

class CurriculumSeeder extends Seeder
{
    public function run(): void
    {
        $subjects = [
            ['name' => 'Mathematics', 'slug' => 'maths'],
            ['name' => 'English', 'slug' => 'english'],
            ['name' => 'Biology', 'slug' => 'biology'],
            ['name' => 'Chemistry', 'slug' => 'chemistry'],
            ['name' => 'Physics', 'slug' => 'physics'],
        ];

        foreach ($subjects as $subject) {
            Subject::firstOrCreate(['slug' => $subject['slug']], $subject);
        }

        $levels = [
            ['name' => 'GCSE', 'slug' => 'gcse'],
            ['name' => 'IGCSE', 'slug' => 'igcse'],
            ['name' => 'AS Level', 'slug' => 'as'],
            ['name' => 'A Level', 'slug' => 'a-level'],
        ];

        foreach ($levels as $level) {
            Level::firstOrCreate(['slug' => $level['slug']], $level);
        }

        $examBoards = [
            ['name' => 'AQA', 'slug' => 'aqa'],
            ['name' => 'Edexcel', 'slug' => 'edexcel'],
            ['name' => 'OCR', 'slug' => 'ocr'],
            ['name' => 'WJEC', 'slug' => 'wjec'],
            ['name' => 'CIE', 'slug' => 'cie'],
        ];

        foreach ($examBoards as $board) {
            ExamBoard::firstOrCreate(['slug' => $board['slug']], $board);
        }
    }
}
