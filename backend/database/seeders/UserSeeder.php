<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Svaka kompanija dobija 6 zaposlenih.
        foreach (Company::all() as $company) {
            User::factory(6)->for($company)->create();
        }

        // Dva frilensera bez glavne kompanije.
        User::factory(2)->withoutCompany()->create();
    }
}
