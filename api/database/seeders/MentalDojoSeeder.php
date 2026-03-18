<?php

namespace Database\Seeders;

use App\Models\MentalDojoCourse;
use App\Models\MentalDojoModule;
use Illuminate\Database\Seeder;

class MentalDojoSeeder extends Seeder
{
    public function run(): void
    {
        $courses = [
            [
                'title' => 'Exam Calmness',
                'category' => 'exam_calmness',
                'description' => 'Learn techniques to stay calm and focused before and during exams.',
                'icon' => 'shield',
                'order' => 1,
                'modules' => [
                    ['title' => 'Understanding Exam Anxiety', 'type' => 'lesson', 'duration_minutes' => 5, 'content' => ['text' => 'Exam anxiety is a normal response. Your body releases adrenaline to help you perform, but too much can overwhelm. In this course, you will learn to channel this energy positively.', 'key_points' => ['Anxiety is normal and manageable', 'Your body is trying to help you', 'Techniques can redirect nervous energy']]],
                    ['title' => 'Pre-Exam Breathing', 'type' => 'breathing', 'duration_minutes' => 3, 'content' => ['instructions' => 'Box breathing: Breathe in for 4 counts, hold for 4 counts, breathe out for 4 counts, hold for 4 counts. Repeat 5 times.', 'steps' => [['action' => 'inhale', 'duration' => 4], ['action' => 'hold', 'duration' => 4], ['action' => 'exhale', 'duration' => 4], ['action' => 'hold', 'duration' => 4]], 'cycles' => 5]],
                    ['title' => 'Exam Day Visualization', 'type' => 'visualization', 'duration_minutes' => 5, 'content' => ['instructions' => 'Close your eyes. Picture yourself walking into the exam hall confidently. You sit down, read each question calmly, and recall everything you have studied. You write clearly and finish with time to review. Imagine the relief and pride as you hand in your paper.', 'steps' => ['Enter the room feeling prepared', 'Sit down and take three deep breaths', 'Read each question carefully', 'Write your answers with confidence', 'Finish and feel proud of your effort']]],
                    ['title' => 'Post-Exam Reflection', 'type' => 'reflection', 'duration_minutes' => 5, 'content' => ['prompts' => ['What went well in my preparation?', 'What would I do differently next time?', 'What am I proud of regardless of the result?', 'How can I be kind to myself right now?']]],
                ],
            ],
            [
                'title' => 'Focus & Concentration',
                'category' => 'focus',
                'description' => 'Build your ability to concentrate deeply during study sessions.',
                'icon' => 'target',
                'order' => 2,
                'modules' => [
                    ['title' => 'The Science of Focus', 'type' => 'lesson', 'duration_minutes' => 5, 'content' => ['text' => 'Focus is like a muscle — it gets stronger with practice. Your brain can only deeply focus for about 25 minutes before it needs a break. The Pomodoro technique uses this science.', 'key_points' => ['Focus improves with practice', '25-minute deep focus blocks are optimal', 'Breaks are essential, not lazy']]],
                    ['title' => 'Focus Breathing', 'type' => 'breathing', 'duration_minutes' => 2, 'content' => ['instructions' => 'Energizing breath: Breathe in sharply through your nose for 1 second, then out slowly for 4 seconds. This activates alertness. Repeat 10 times.', 'steps' => [['action' => 'sharp_inhale', 'duration' => 1], ['action' => 'slow_exhale', 'duration' => 4]], 'cycles' => 10]],
                    ['title' => 'Single-Point Focus Exercise', 'type' => 'exercise', 'duration_minutes' => 3, 'content' => ['instructions' => 'Pick a single object on your desk. Study it intently for 60 seconds — its colour, texture, shape, weight. When your mind wanders, gently return to the object. This trains your focus muscle.', 'duration_seconds' => 60]],
                ],
            ],
            [
                'title' => 'Confidence Building',
                'category' => 'confidence',
                'description' => 'Strengthen your belief in your ability to learn and succeed.',
                'icon' => 'star',
                'order' => 3,
                'modules' => [
                    ['title' => 'Growth Mindset', 'type' => 'lesson', 'duration_minutes' => 5, 'content' => ['text' => 'Intelligence is not fixed. Every time you struggle with a problem and persist, your brain forms new neural connections. Mistakes are not failures — they are your brain growing. The students who improve the most are those who embrace challenge.', 'key_points' => ['Your brain grows when you struggle', 'Mistakes build neural connections', 'Effort matters more than talent']]],
                    ['title' => 'Achievement Visualization', 'type' => 'visualization', 'duration_minutes' => 5, 'content' => ['instructions' => 'Close your eyes. Think of a time you succeeded at something difficult. Remember how you felt — the pride, the relief, the joy. Now imagine that same feeling after your next exam. You studied hard, you stayed focused, and it paid off. Hold onto that feeling.', 'steps' => ['Recall a past success', 'Remember the feeling of achievement', 'Project that feeling onto your next challenge', 'Believe you can do it again']]],
                    ['title' => 'Confidence Reflection', 'type' => 'reflection', 'duration_minutes' => 5, 'content' => ['prompts' => ['Name three things I have improved at this term.', 'What is a challenge I overcame that I am proud of?', 'What strengths do I bring to my learning?', 'Write one encouraging sentence to my future self before exams.']]],
                ],
            ],
            [
                'title' => 'Stress Relief',
                'category' => 'breathing',
                'description' => 'Quick techniques to release tension and reset your mind.',
                'icon' => 'wind',
                'order' => 4,
                'modules' => [
                    ['title' => '4-7-8 Relaxation Breath', 'type' => 'breathing', 'duration_minutes' => 3, 'content' => ['instructions' => 'Breathe in through your nose for 4 counts. Hold for 7 counts. Exhale slowly through your mouth for 8 counts. This activates your parasympathetic nervous system and calms you down quickly.', 'steps' => [['action' => 'inhale', 'duration' => 4], ['action' => 'hold', 'duration' => 7], ['action' => 'exhale', 'duration' => 8]], 'cycles' => 4]],
                    ['title' => 'Body Scan Relaxation', 'type' => 'exercise', 'duration_minutes' => 5, 'content' => ['instructions' => 'Starting from your toes, slowly bring attention to each part of your body. Notice any tension. As you breathe out, imagine that tension melting away. Move upward through your legs, stomach, chest, shoulders, arms, neck, and face.', 'body_parts' => ['toes', 'feet', 'legs', 'stomach', 'chest', 'shoulders', 'arms', 'hands', 'neck', 'face']]],
                    ['title' => 'Gratitude Reflection', 'type' => 'reflection', 'duration_minutes' => 3, 'content' => ['prompts' => ['Name three things I am grateful for today.', 'Who helped me learn something recently?', 'What is one small thing that made me smile today?']]],
                ],
            ],
        ];

        foreach ($courses as $courseData) {
            $modules = $courseData['modules'];
            unset($courseData['modules']);

            $course = MentalDojoCourse::firstOrCreate(
                ['title' => $courseData['title']],
                array_merge($courseData, ['modules_count' => count($modules)])
            );

            foreach ($modules as $i => $moduleData) {
                MentalDojoModule::firstOrCreate(
                    ['course_id' => $course->id, 'title' => $moduleData['title']],
                    array_merge($moduleData, ['order' => $i, 'xp_reward' => 10])
                );
            }
        }
    }
}
