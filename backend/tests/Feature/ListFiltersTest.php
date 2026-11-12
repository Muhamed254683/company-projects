<?php

namespace Tests\Feature;

use App\Enums\ProjectStatus;
use App\Models\Company;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

// Pretraga i filteri na listama (GET /api/companies, /api/users, /api/projects).
// Baza je SQLite u memoriji: ona razlikuje kvacice (MySQL ne), pa ovde trazimo tekst bez kvacica.
class ListFiltersTest extends TestCase
{
    use RefreshDatabase;

    private function names(string $url, string $field = 'name'): array
    {
        return collect($this->getJson($url)->assertOk()->json('data'))->pluck($field)->sort()->values()->all();
    }

    public function test_companies_search_by_name_tax_number_city_and_email(): void
    {
        Company::factory()->create(['name' => 'Alfa Soft d.o.o.', 'tax_number' => '111111111', 'city' => 'Beograd', 'email' => 'info@alfa.rs']);
        Company::factory()->create(['name' => 'Beta Tech d.o.o.', 'tax_number' => '222222222', 'city' => 'Novi Sad', 'email' => 'kontakt@beta.rs']);

        $this->assertSame(['Alfa Soft d.o.o.'], $this->names('/api/companies?search=alfa'));
        $this->assertSame(['Beta Tech d.o.o.'], $this->names('/api/companies?search=222222'));
        $this->assertSame(['Beta Tech d.o.o.'], $this->names('/api/companies?search=novi sad'));
        $this->assertSame(['Alfa Soft d.o.o.'], $this->names('/api/companies?search=info@'));
        $this->assertSame(['Alfa Soft d.o.o.', 'Beta Tech d.o.o.'], $this->names('/api/companies?search=d.o.o'));
        $this->assertSame([], $this->names('/api/companies?search=nepostoji'));
    }

    public function test_companies_filter_by_city_and_pagination_links_keep_filters(): void
    {
        Company::factory(3)->create(['city' => 'Beograd']);
        Company::factory(2)->create(['city' => 'Niš']);

        $response = $this->getJson('/api/companies?city=Beograd&search=d.o.o&per_page=2')->assertOk();

        $this->assertSame(3, $response->json('meta.total'));
        $this->assertStringContainsString('city=Beograd', $response->json('links.next'));
        $this->assertStringContainsString('search=d.o.o', $response->json('links.next'));
    }

    public function test_users_search_by_multiple_words_and_email(): void
    {
        User::factory()->create(['first_name' => 'Milin', 'last_name' => 'Bolic', 'email' => 'milin@example.com', 'job_title' => 'Tester']);
        User::factory()->create(['first_name' => 'Milina', 'last_name' => 'Vranic', 'email' => 'milina@example.com', 'job_title' => 'Developer']);

        // Svaka rec mora da se nadje: "milin" je u oba imena, "bolic" samo u jednom prezimenu.
        $this->assertSame(['Bolic'], $this->names('/api/users?search=milin bolic', 'last_name'));
        $this->assertSame(['Bolic', 'Vranic'], $this->names('/api/users?search=milin', 'last_name'));
        $this->assertSame(['Vranic'], $this->names('/api/users?search=milina@', 'last_name'));
        $this->assertSame(['Vranic'], $this->names('/api/users?search=developer', 'last_name'));
    }

    public function test_users_filter_by_company_or_without_company(): void
    {
        $company = Company::factory()->create();
        User::factory()->for($company)->create(['last_name' => 'Zaposleni']);
        User::factory()->withoutCompany()->create(['last_name' => 'Frilenser']);

        $this->assertSame(['Zaposleni'], $this->names("/api/users?company_id={$company->id}", 'last_name'));
        $this->assertSame(['Frilenser'], $this->names('/api/users?company_id=none', 'last_name'));
    }

    public function test_projects_search_status_and_company_filters_combined(): void
    {
        [$first, $second] = Company::factory(2)->create();
        Project::factory()->for($first)->create(['name' => 'CRM Orion', 'description' => 'Migracija podataka', 'status' => ProjectStatus::Active]);
        Project::factory()->for($first)->create(['name' => 'ERP Vega', 'description' => 'Novi API', 'status' => ProjectStatus::Planned]);
        Project::factory()->for($second)->create(['name' => 'CRM Lira', 'description' => 'Redizajn', 'status' => ProjectStatus::Active]);

        $this->assertSame(['CRM Lira', 'CRM Orion'], $this->names('/api/projects?search=crm'));
        $this->assertSame(['CRM Orion'], $this->names('/api/projects?search=migracija'));
        $this->assertSame(['CRM Lira', 'CRM Orion'], $this->names('/api/projects?status=active'));
        $this->assertSame(['CRM Orion'], $this->names("/api/projects?search=crm&status=active&company_id={$first->id}"));
    }

    public function test_invalid_filter_values_return_422(): void
    {
        $this->getJson('/api/projects?status=gotovo')->assertUnprocessable()->assertJsonValidationErrors('status');
        $this->getJson('/api/projects?company_id=abc')->assertUnprocessable()->assertJsonValidationErrors('company_id');
        $this->getJson('/api/users?company_id=abc')->assertUnprocessable()->assertJsonValidationErrors('company_id');
        $this->getJson('/api/companies?search='.str_repeat('a', 101))->assertUnprocessable()->assertJsonValidationErrors('search');
    }

    public function test_search_adds_dj_variant_and_escapes_like_wildcards(): void
    {
        // Proveravamo vrednosti koje idu u SQL (rezultat zavisi od baze: MySQL ne razlikuje c/ć, SQLite razlikuje).
        // Trazi se i originalni tekst i varijanta u kojoj je svako "dj" zamenjeno sa "đ".
        $this->assertSame(['%djordjevic%', '%đorđevic%'], User::search('djordjevic', ['last_name'])->getBindings());

        // "50%" trazi bas znak %, a ne "bilo sta".
        $this->assertSame(['%50\%%'], Company::search('50%', ['name'])->getBindings());
    }
}
