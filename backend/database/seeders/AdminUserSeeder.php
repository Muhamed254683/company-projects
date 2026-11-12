<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

// Poznat nalog za prijavu u aplikaciju: admin@example.com / password (samo za lokalni razvoj!).
// Moze da se pokrene i sam, na postojecoj bazi: php artisan db:seed --class=AdminUserSeeder
// firstOrCreate: ako nalog vec postoji, nista se ne menja.
class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'company_id' => Company::orderBy('id')->value('id'),
                'first_name' => 'Admin',
                'last_name' => 'Administrator',
                'job_title' => 'Administrator',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
        );
    }
}
