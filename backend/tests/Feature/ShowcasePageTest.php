<?php

namespace Tests\Feature;

use App\Enums\ProjectStatus;
use App\Models\Company;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

// Blade stranica "/showcase/{slug}". Baza je privremena SQLite u memoriji (phpunit.xml).
class ShowcasePageTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    public function test_showcase_shows_project_company_team_and_gallery(): void
    {
        $company = Company::factory()->create(['name' => 'Moja Firma d.o.o.']);
        $other_company = Company::factory()->create(['name' => 'Druga Firma d.o.o.']);
        $project = Project::factory()->for($company)->create([
            'name' => 'Javni projekat',
            'status' => ProjectStatus::Active,
            'description' => 'Opis javnog projekta.',
            'budget' => 98765.43,
        ]);

        $own = User::factory()->for($company)->create(['first_name' => 'Ana', 'last_name' => 'Domaća']);
        $outsider = User::factory()->for($other_company)->create(['first_name' => 'Boris', 'last_name' => 'Spoljni']);
        $freelancer = User::factory()->withoutCompany()->create(['first_name' => 'Cveta', 'last_name' => 'Frilenserka']);
        $project->members()->attach([
            $own->id => ['role' => 'manager'],
            $outsider->id => ['role' => 'developer'],
            $freelancer->id => ['role' => 'designer'],
        ]);
        $project->images()->create(['path' => "projects/{$project->id}/slika.png", 'original_name' => 'slika.png', 'mime_type' => 'image/png', 'size' => 100]);

        $response = $this->get("/showcase/{$project->slug}");

        $response->assertOk()
            ->assertViewIs('showcase')
            ->assertSee('<title>Javni projekat · Company Projects</title>', false)
            ->assertSee('Moja Firma d.o.o.')
            ->assertSee('Opis javnog projekta.')
            ->assertSee('Aktivan')
            ->assertSee('Galerija (1)')
            ->assertSee("/storage/projects/{$project->id}/slika.png", false)
            ->assertSee('Ana Domaća')
            ->assertSee('Menadžer')
            ->assertSee('Developer')
            ->assertSee('Dizajner')
            ->assertSee('Druga firma')
            ->assertSee('Frilenser');

        // Tacno dva spoljna clana su obojena.
        $this->assertSame(2, substr_count($response->getContent(), 'bg-amber-50" data-member='));
    }

    public function test_showcase_does_not_show_emails_or_budget(): void
    {
        $project = Project::factory()->create(['budget' => 98765.43]);
        $member = User::factory()->create(['email' => 'tajni.email@example.com']);
        $project->members()->attach($member->id, ['role' => 'tester']);

        $this->get("/showcase/{$project->slug}")
            ->assertOk()
            ->assertDontSee('tajni.email@example.com')
            ->assertDontSee('98.765,43')
            ->assertDontSee('98765.43');
    }

    public function test_showcase_escapes_html_in_description(): void
    {
        $project = Project::factory()->create(['description' => '<script>alert("xss")</script>']);

        $this->get("/showcase/{$project->slug}")
            ->assertOk()
            ->assertDontSee('<script>alert("xss")</script>', false)
            ->assertSee('&lt;script&gt;', false);
    }

    public function test_unknown_slug_returns_custom_404_page(): void
    {
        $this->get('/showcase/ne-postoji')
            ->assertNotFound()
            ->assertSee('Stranica ne postoji');
    }

    public function test_showcase_is_found_only_by_slug_not_by_id(): void
    {
        $project = Project::factory()->create();

        $this->get("/showcase/{$project->id}")->assertNotFound();
    }
}
