<?php

namespace Database\Seeders;

use App\Enums\ProjectRole;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProjectMemberSeeder extends Seeder
{
    private const TEAM_ROLES = [ProjectRole::Developer, ProjectRole::Designer, ProjectRole::Tester];

    public function run(): void
    {
        foreach (Project::with('company.users')->get() as $project) {
            $own_users = $project->company->users;

            // 1 manager iz kompanije vlasnika projekta.
            $manager = $own_users->random();
            $members = [$manager->id => ['role' => ProjectRole::Manager->value]];

            // 2-4 clana tima iz iste kompanije.
            $team = $own_users->except($manager->id)->random(fake()->numberBetween(2, 4));
            foreach ($team as $user) {
                $members[$user->id] = ['role' => fake()->randomElement(self::TEAM_ROLES)->value];
            }

            // 1-2 clana iz DRUGIH kompanija ili frilenseri (zahtev iz zadatka).
            $external_users = User::where(function ($query) use ($project) {
                $query->where('company_id', '!=', $project->company_id)
                    ->orWhereNull('company_id');
            })->inRandomOrder()->limit(fake()->numberBetween(1, 2))->get();

            foreach ($external_users as $user) {
                $members[$user->id] = ['role' => fake()->randomElement(self::TEAM_ROLES)->value];
            }

            $project->members()->attach($members);
        }
    }
}
