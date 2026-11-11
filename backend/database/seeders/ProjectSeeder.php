<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Project;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    public function run(): void
    {
        // Svaka kompanija dobija 3 projekta.
        foreach (Company::all() as $company) {
            Project::factory(3)->for($company)->create();
        }
    }
}
