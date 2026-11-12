<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ListProjectsRequest;
use App\Http\Requests\ProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class ProjectController extends Controller
{
    /**
     * GET /api/projects?page=1&per_page=15&search=orion&company_id=2&status=active
     */
    public function index(ListProjectsRequest $request): AnonymousResourceCollection
    {
        $per_page = min(max($request->integer('per_page', 15), 1), 100);

        $projects = Project::with('company')
            ->withCount(['members', 'images'])
            ->search($request->input('search'), ['name', 'description'])
            ->when($request->filled('company_id'), fn ($query) => $query->where('company_id', $request->integer('company_id')))
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')))
            ->orderBy('name')
            ->paginate($per_page)
            ->withQueryString();

        return ProjectResource::collection($projects);
    }

    /**
     * POST /api/projects
     */
    public function store(ProjectRequest $request): ProjectResource
    {
        $project = Project::create($request->validated());

        return ProjectResource::make($this->loadDetails($project));
    }

    /**
     * GET /api/projects/{project}
     */
    public function show(Project $project): ProjectResource
    {
        return ProjectResource::make($this->loadDetails($project));
    }

    /**
     * PUT/PATCH /api/projects/{project}
     */
    public function update(ProjectRequest $request, Project $project): ProjectResource
    {
        $project->update($request->validated());

        return ProjectResource::make($this->loadDetails($project));
    }

    /**
     * DELETE /api/projects/{project}
     */
    public function destroy(Project $project): Response
    {
        // Project::deleting (iz modela) brise slike sa diska; transakcija cuva bazu ako nesto pukne.
        DB::transaction(fn () => $project->delete());

        return response()->noContent();
    }

    /**
     * Sve sto prikazujemo uz jedan projekat, na jednom mestu.
     */
    private function loadDetails(Project $project): Project
    {
        return $project
            ->load([
                'company',
                'members' => fn ($query) => $query->with('company')->orderBy('last_name')->orderBy('first_name'),
                'images' => fn ($query) => $query->latest(),
            ])
            ->loadCount(['members', 'images']);
    }
}
