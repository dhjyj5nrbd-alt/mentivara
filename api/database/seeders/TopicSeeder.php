<?php

namespace Database\Seeders;

use App\Models\CurriculumTopic;
use App\Models\Level;
use App\Models\Subject;
use Illuminate\Database\Seeder;

class TopicSeeder extends Seeder
{
    public function run(): void
    {
        $gcse = Level::where('slug', 'gcse')->first();
        $aLevel = Level::where('slug', 'a-level')->first();
        if (!$gcse || !$aLevel) return;

        $topics = [
            'maths' => [
                'gcse' => ['Number', 'Algebra', 'Ratio & Proportion', 'Geometry', 'Probability & Statistics'],
                'a-level' => ['Pure Mathematics', 'Statistics', 'Mechanics'],
            ],
            'english' => [
                'gcse' => ['Reading Comprehension', 'Writing Skills', 'Poetry', 'Shakespeare', 'Modern Texts'],
                'a-level' => ['Literary Analysis', 'Creative Writing', 'Critical Theory', 'Comparative Literature'],
            ],
            'biology' => [
                'gcse' => ['Cell Biology', 'Organisation', 'Infection & Response', 'Bioenergetics', 'Homeostasis', 'Inheritance', 'Ecology'],
                'a-level' => ['Biological Molecules', 'Cells', 'Organisms Exchange', 'Genetics', 'Energy Transfers', 'Ecosystems'],
            ],
            'chemistry' => [
                'gcse' => ['Atomic Structure', 'Bonding', 'Quantitative Chemistry', 'Chemical Changes', 'Energy Changes', 'Rates & Equilibrium', 'Organic Chemistry'],
                'a-level' => ['Physical Chemistry', 'Inorganic Chemistry', 'Organic Chemistry', 'Analysis'],
            ],
            'physics' => [
                'gcse' => ['Energy', 'Electricity', 'Particle Model', 'Atomic Structure', 'Forces', 'Waves', 'Magnetism'],
                'a-level' => ['Particles & Radiation', 'Waves & Optics', 'Mechanics', 'Electricity', 'Further Mechanics', 'Fields', 'Nuclear Physics'],
            ],
        ];

        foreach ($topics as $subjectSlug => $levelTopics) {
            $subject = Subject::where('slug', $subjectSlug)->first();
            if (!$subject) continue;

            foreach ($levelTopics as $levelSlug => $topicNames) {
                $level = $levelSlug === 'gcse' ? $gcse : $aLevel;

                foreach ($topicNames as $order => $name) {
                    CurriculumTopic::firstOrCreate(
                        ['subject_id' => $subject->id, 'level_id' => $level->id, 'name' => $name],
                        ['order' => $order]
                    );
                }
            }
        }
    }
}
