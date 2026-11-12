<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

// Pitanje 3 iz zadatka: brisanje mora da obrise i fajlove slika sa diska, ne samo redove u bazi.
// Storage::fake('public') pravi privremeni "lazni" disk, pa test ne dira prave fajlove.
class DeletingRemovesImageFilesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

    // Upload preko API-ja, kao sto radi aplikacija; vraca putanju fajla na disku.
    private function uploadImage(Project $project): string
    {
        // Pravi PNG od 1x1 piksela (UploadedFile::fake()->image() bi trazio PHP ekstenziju GD).
        $png = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==');

        $response = $this->post("/api/projects/{$project->id}/images", [
            'images' => [UploadedFile::fake()->createWithContent('slika.png', $png)],
        ], ['Accept' => 'application/json']);

        $response->assertCreated();

        $path = $project->images()->latest('id')->value('path');
        Storage::disk('public')->assertExists($path);

        return $path;
    }

    public function test_deleting_an_image_removes_its_file(): void
    {
        $project = Project::factory()->create();
        $path = $this->uploadImage($project);
        $image_id = $project->images()->value('id');

        $this->deleteJson("/api/projects/{$project->id}/images/{$image_id}")->assertNoContent();

        Storage::disk('public')->assertMissing($path);
        $this->assertDatabaseMissing('project_images', ['id' => $image_id]);
    }

    public function test_project_in_trash_keeps_files_and_force_delete_removes_them(): void
    {
        $project = Project::factory()->create();
        $first = $this->uploadImage($project);
        $second = $this->uploadImage($project);

        // 1) Obicno brisanje = korpa: fajlovi i redovi slika OSTAJU (projekat moze da se vrati).
        $this->deleteJson("/api/projects/{$project->id}")->assertNoContent();
        Storage::disk('public')->assertExists([$first, $second]);
        $this->assertDatabaseCount('project_images', 2);

        // 2) Trajno brisanje iz korpe: fajlovi nestaju sa diska.
        $this->deleteJson("/api/projects/{$project->id}/force")->assertNoContent();
        Storage::disk('public')->assertMissing([$first, $second]);
        $this->assertDatabaseCount('project_images', 0);
    }

    public function test_deleting_a_company_removes_projects_and_files_but_keeps_users(): void
    {
        $company = Company::factory()->create();
        $project = Project::factory()->for($company)->create();
        $user = User::factory()->for($company)->create();
        $project->members()->attach($user->id, ['role' => 'developer']);
        $path = $this->uploadImage($project);

        $this->deleteJson("/api/companies/{$company->id}")->assertNoContent();

        Storage::disk('public')->assertMissing($path);
        $this->assertDatabaseMissing('projects', ['id' => $project->id]);
        $this->assertDatabaseCount('project_user', 0);
        // Korisnik ostaje, samo bez firme (ON DELETE SET NULL).
        $this->assertDatabaseHas('users', ['id' => $user->id, 'company_id' => null]);
    }
}
