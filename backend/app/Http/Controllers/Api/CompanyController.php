<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CompanyRequest;
use App\Http\Resources\CompanyResource;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class CompanyController extends Controller
{
    /**
     * GET /api/companies?page=1&per_page=15
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        // per_page je ogranicen na 1-100, da niko ne moze da trazi milion redova odjednom.
        $per_page = min(max($request->integer('per_page', 15), 1), 100);

        $companies = Company::withCount(['users', 'projects'])
            ->orderBy('name')
            ->paginate($per_page);

        return CompanyResource::collection($companies);
    }

    /**
     * POST /api/companies
     */
    public function store(CompanyRequest $request): CompanyResource
    {
        // validated() vraca SAMO polja koja su prosla validaciju.
        $company = Company::create($request->validated());

        return CompanyResource::make($company);
    }

    /**
     * GET /api/companies/{company}
     */
    public function show(Company $company): CompanyResource
    {
        return CompanyResource::make($company->loadCount(['users', 'projects']));
    }

    /**
     * PUT/PATCH /api/companies/{company}
     */
    public function update(CompanyRequest $request, Company $company): CompanyResource
    {
        $company->update($request->validated());

        return CompanyResource::make($company->loadCount(['users', 'projects']));
    }

    /**
     * DELETE /api/companies/{company}
     */
    public function destroy(Company $company): Response
    {
        // Transakcija: ako bilo sta pukne usred brisanja projekata, baza se vraca kako je bila.
        DB::transaction(fn () => $company->delete());

        return response()->noContent();
    }
}
