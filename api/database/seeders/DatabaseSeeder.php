<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->call([
            CurriculumSeeder::class,
            TopicSeeder::class,
            QuestionSeeder::class,
            ForumSeeder::class,
            MentalDojoSeeder::class,
        ]);

        User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@mentivara.com',
            'role' => 'admin',
        ]);
    }
}
