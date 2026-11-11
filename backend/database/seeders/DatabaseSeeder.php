<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     * Redosled je bitan: korisnici i projekti trebaju kompanije, a clanstva trebaju sve troje.
     */
    public function run(): void
    {
        $this->call([
            CompanySeeder::class,
            UserSeeder::class,
            ProjectSeeder::class,
            ProjectMemberSeeder::class,
        ]);
    }
}
