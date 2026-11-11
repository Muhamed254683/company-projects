<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Project;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

// Testovi rade na posebnoj bazi u memoriji (SQLite, vidi phpunit.xml), a ne na MySQL bazi aplikacije.
class ProjectSlugTest extends TestCase
{
    use RefreshDatabase;

    public function test_slug_is_generated_from_name_on_create(): void
    {
        $project = Project::factory()->create(['name' => 'CRM sistem Čačak Đurđevdan']);

        $this->assertSame('crm-sistem-cacak-durdevdan', $project->slug);
    }

    public function test_same_name_in_another_company_gets_numbered_slug(): void
    {
        [$first_company, $second_company] = Company::factory(2)->create();

        $first = Project::factory()->for($first_company)->create(['name' => 'Veb prodavnica']);
        $second = Project::factory()->for($second_company)->create(['name' => 'Veb prodavnica']);

        $this->assertSame('veb-prodavnica', $first->slug);
        $this->assertSame('veb-prodavnica-2', $second->slug);
    }

    public function test_slug_does_not_change_when_name_changes(): void
    {
        $project = Project::factory()->create(['name' => 'Stari naziv']);

        $project->update(['name' => 'Novi naziv']);

        $this->assertSame('stari-naziv', $project->fresh()->slug);
    }

    public function test_slug_cannot_be_set_through_the_api(): void
    {
        $company = Company::factory()->create();

        $response = $this->postJson('/api/projects', [
            'company_id' => $company->id,
            'name' => 'API projekat',
            'slug' => 'moj-slug',
        ]);

        $response->assertCreated()->assertJsonPath('data.slug', 'api-projekat');
    }

    public function test_seeder_creates_projects_with_unique_slugs(): void
    {
        $this->seed();

        $slugs = Project::pluck('slug');

        $this->assertCount(15, $slugs);
        $this->assertSame($slugs->count(), $slugs->unique()->count());
        $this->assertFalse($slugs->contains(fn ($slug) => empty($slug)));
    }
}
