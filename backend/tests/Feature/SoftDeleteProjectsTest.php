<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

// Soft delete projekata: korpa, vracanje i trajno brisanje.
class SoftDeleteProjectsTest extends TestCase
{
    use RefreshDatabase;

    private function projectWithMember(): Project
    {
        $project = Project::factory()->create(['name' => 'Projekat za korpu']);
        $project->members()->attach(User::factory()->create()->id, ['role' => 'developer']);

        return $project;
    }

    public function test_delete_moves_project_to_trash_and_hides_it_everywhere(): void
    {
        $this->withoutVite();
        $project = $this->projectWithMember();

        $this->deleteJson("/api/projects/{$project->id}")->assertNoContent();

        $this->assertSoftDeleted($project);
        $this->getJson('/api/projects')->assertOk()->assertJsonCount(0, 'data');
        $this->getJson("/api/projects/{$project->id}")->assertNotFound();
        $this->get("/showcase/{$project->slug}")->assertNotFound();
        $this->getJson("/api/companies/{$project->company_id}")->assertJsonPath('data.projects_count', 0);
        // Clanstvo ostaje sacuvano (za vracanje).
        $this->assertDatabaseCount('project_user', 1);
    }

    public function test_trash_list_shows_only_deleted_projects(): void
    {
        $kept = Project::factory()->create();
        $trashed = Project::factory()->create();
        $trashed->delete();

        $response = $this->getJson('/api/projects?trashed=only')->assertOk();

        $this->assertSame([$trashed->id], array_column($response->json('data'), 'id'));
        $this->assertNotNull($response->json('data.0.deleted_at'));
        $this->assertNotContains($kept->id, array_column($response->json('data'), 'id'));
    }

    public function test_restore_brings_project_back_with_members(): void
    {
        $project = $this->projectWithMember();
        $project->delete();

        $this->postJson("/api/projects/{$project->id}/restore")
            ->assertOk()
            ->assertJsonPath('data.deleted_at', null)
            ->assertJsonPath('data.members_count', 1);

        $this->assertNotSoftDeleted($project);
        $this->getJson("/api/projects/{$project->id}")->assertOk();
    }

    public function test_force_delete_removes_project_and_memberships_permanently(): void
    {
        $project = $this->projectWithMember();
        $project->delete();

        $this->deleteJson("/api/projects/{$project->id}/force")->assertNoContent();

        $this->assertDatabaseMissing('projects', ['id' => $project->id]);
        $this->assertDatabaseCount('project_user', 0);
        // Korisnik ostaje.
        $this->assertDatabaseCount('users', 1);
    }

    public function test_restore_and_force_delete_require_project_in_trash(): void
    {
        $project = Project::factory()->create();

        $this->postJson("/api/projects/{$project->id}/restore")->assertStatus(409);
        $this->deleteJson("/api/projects/{$project->id}/force")->assertStatus(409);
        $this->assertNotSoftDeleted($project);
    }

    public function test_name_of_project_in_trash_cannot_be_reused_in_same_company(): void
    {
        $project = Project::factory()->create(['name' => 'CRM Orion']);
        $project->delete();

        $this->postJson('/api/projects', ['company_id' => $project->company_id, 'name' => 'CRM Orion'])
            ->assertUnprocessable()
            ->assertJsonPath('errors.name.0', 'This company already has a project with this name (it may be in the trash).');
    }

    public function test_same_name_in_another_company_gets_new_slug_while_first_is_in_trash(): void
    {
        $project = Project::factory()->create(['name' => 'CRM Orion']);
        $project->delete();
        $other_company = Company::factory()->create();

        // Bez withTrashed() u uniqueSlug() ovo bi dobilo isti slug i baza bi odbila upis (500).
        $this->postJson('/api/projects', ['company_id' => $other_company->id, 'name' => 'CRM Orion'])
            ->assertCreated()
            ->assertJsonPath('data.slug', 'crm-orion-2');
    }

    public function test_deleting_company_force_deletes_its_projects_in_trash(): void
    {
        $project = Project::factory()->create();
        $project->delete();

        $this->deleteJson("/api/companies/{$project->company_id}")->assertNoContent();

        $this->assertDatabaseMissing('projects', ['id' => $project->id]);
    }

    public function test_invalid_trashed_value_returns_422(): void
    {
        $this->getJson('/api/projects?trashed=all')->assertUnprocessable()->assertJsonValidationErrors('trashed');
    }
}
