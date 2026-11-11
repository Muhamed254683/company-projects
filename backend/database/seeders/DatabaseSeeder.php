<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

// Namerno BEZ "WithoutModelEvents" (iz Laravel sablona): model eventi moraju da rade i pri seedovanju,
// jer Project::creating pravi slug. Bez njega bi seeder napravio projekte bez slug-a i pukao.
class DatabaseSeeder extends Seeder
{
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
