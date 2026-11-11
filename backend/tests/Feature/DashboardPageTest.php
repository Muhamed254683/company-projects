<?php

namespace Tests\Feature;

use App\Enums\ProjectStatus;
use App\Models\Company;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

// Blade stranica "/" (dashboard). Baza je privremena SQLite u memoriji (phpunit.xml).
class DashboardPageTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Testovi ne zavise od "npm run build": @vite ne trazi izgradjene CSS fajlove.
        $this->withoutVite();
    }

    public function test_dashboard_shows_totals_and_projects_by_status(): void
    {
        $company = Company::factory()->create();
        Company::factory()->create();
        User::factory(3)->for($company)->create();
        Project::factory(2)->for($company)->create(['status' => ProjectStatus::Active]);
        Project::factory()->for($company)->create(['status' => ProjectStatus::Completed]);

        $response = $this->get('/');

        $response->assertOk()
            ->assertViewIs('dashboard')
            ->assertViewHas('companies_total', 2)
            ->assertViewHas('projects_total', 3)
            ->assertViewHas('users_total', 3)
            ->assertSee('data-stat="/companies">2', false)
            ->assertSee('data-stat="/projects">3', false)
            ->assertSee('data-stat="/users">3', false);

        // Svi statusi, i oni sa 0 projekata, u redosledu iz enuma.
        $by_status = $response->viewData('projects_by_status')->mapWithKeys(fn ($row) => [$row['status']->value => $row['count']]);
        $this->assertSame(['planned' => 0, 'active' => 2, 'on_hold' => 0, 'completed' => 1], $by_status->all());
        $response->assertSeeInOrder(['Planiran', 'Aktivan', 'Na čekanju', 'Završen']);
    }

    public function test_dashboard_lists_five_latest_projects_with_showcase_links(): void
    {
        $company = Company::factory()->create();
        $projects = collect(range(1, 6))->map(fn ($i) => Project::factory()->for($company)->create([
            'name' => "Projekat {$i}",
            'created_at' => now()->subDays(10 - $i),
        ]));

        $response = $this->get('/');

        $response->assertOk()
            ->assertSeeInOrder(['Projekat 6', 'Projekat 5', 'Projekat 4', 'Projekat 3', 'Projekat 2'])
            ->assertDontSee('Projekat 1<', false)
            ->assertSee(route('showcase', $projects->last()), false);
    }

    public function test_dashboard_works_with_empty_database(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertSee('Još nema projekata.')
            ->assertSee('data-stat="/projects">0', false);
    }
}
