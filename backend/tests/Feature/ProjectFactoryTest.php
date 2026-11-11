<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Project;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

// Factory mora da napravi i mnogo projekata (ranije je pucao posle 20: OverflowException).
class ProjectFactoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_factory_can_create_many_projects_with_unique_names_and_slugs(): void
    {
        $company = Company::factory()->create();

        // 250 > 200 kombinacija "tip + kodno ime": proverava i dodavanje broja na kraj imena.
        Project::factory(250)->for($company)->create();

        $this->assertSame(250, Project::count());
        $this->assertSame(250, Project::distinct()->count('name'));
        $this->assertSame(250, Project::distinct()->count('slug'));
    }
}
