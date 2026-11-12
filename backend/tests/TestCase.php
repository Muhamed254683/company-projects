<?php

namespace Tests;

use App\Models\User;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Laravel\Sanctum\Sanctum;

abstract class TestCase extends BaseTestCase
{
    /**
     * API je iza prijave (auth:sanctum). Testovi su podrazumevano "prijavljeni" kao korisnik
     * koji NIJE upisan u bazu (make, ne create), da ne bi menjao brojeve korisnika u testovima.
     * Test koji proverava samu prijavu postavlja ovo na false (vidi AuthTest).
     */
    protected bool $acting_as_api_user = true;

    protected function setUp(): void
    {
        parent::setUp();

        if ($this->acting_as_api_user) {
            // withoutCompany(): inace bi factory UPISAO novu kompaniju u bazu (company_id => Company::factory()).
            Sanctum::actingAs(User::factory()->withoutCompany()->make(['id' => 999999]));
        }
    }
}
