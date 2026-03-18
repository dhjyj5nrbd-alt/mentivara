<?php

namespace Database\Seeders;

use App\Models\ForumCategory;
use Illuminate\Database\Seeder;

class ForumSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'GCSE Maths', 'slug' => 'gcse-maths', 'order' => 1],
            ['name' => 'GCSE Science', 'slug' => 'gcse-science', 'order' => 2],
            ['name' => 'A-Level Maths', 'slug' => 'a-level-maths', 'order' => 3],
            ['name' => 'A-Level Science', 'slug' => 'a-level-science', 'order' => 4],
            ['name' => 'English', 'slug' => 'english', 'order' => 5],
            ['name' => 'Study Tips', 'slug' => 'study-tips', 'order' => 6],
            ['name' => 'University Applications', 'slug' => 'university-apps', 'order' => 7],
            ['name' => 'General Discussion', 'slug' => 'general', 'order' => 8],
        ];

        foreach ($categories as $cat) {
            ForumCategory::firstOrCreate(['slug' => $cat['slug']], $cat);
        }
    }
}
