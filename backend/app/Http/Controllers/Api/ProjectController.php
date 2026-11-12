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
     * GET /api/projects?trashed=only   -> samo projekti u korpi (najskorije obrisani prvi)
     */
    public function index(ListProjectsRequest $request): AnonymousResourceCollection
    {
        $per_page = min(max($request->integer('per_page', 15), 1), 100);
        $only_trashed = $request->input('trashed') === 'only';

        $projects = Project::with('company')
            ->withCount(['members', 'images'])
            ->search($request->input('search'), ['name', 'description'])
            ->when($request->filled('company_id'), fn ($query) => $query->where('company_id', $request->integer('company_id')))
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')))
            ->when(
                $only_trashed,
                fn ($query) => $query->onlyTrashed()->orderByDesc('deleted_at'),
                fn ($query) => $query->orderBy('name'),
            )
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
     * DELETE /api/projects/{project}   -> premesta projekat u korpu (soft delete).
     * Slike (i na disku) i clanovi ostaju, da bi projekat mogao da se vrati.
     */
    public function destroy(Project $project): Response
    {
        $project->delete();

        return response()->noContent();
    }

    /**
     * POST /api/projects/{project}/restore   -> vraca projekat iz korpe.
     * Ruta ima ->withTrashed(), pa Laravel pronalazi i projekat iz korpe.
     */
    public function restore(Project $project): ProjectResource
    {
        abort_unless($project->trashed(), 409, 'This project is not in the trash.');

        $project->restore();

        return ProjectResource::make($this->loadDetails($project));
    }

    /**
     * DELETE /api/projects/{project}/force   -> trajno brisanje projekta iz korpe.
     * Project::forceDeleting (iz modela) brise slike sa diska; transakcija cuva bazu ako nesto pukne.
     */
    public function forceDestroy(Project $project): Response
    {
        // Trajno se brise samo iz korpe: tako je trajno brisanje uvek "drugi korak", nikad slucajno.
        abort_unless($project->trashed(), 409, 'Move the project to the trash first.');

        DB::transaction(fn () => $project->forceDelete());

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
                // Redosled iz galerije (position), koji korisnik menja prevlacenjem.
                'images' => fn ($query) => $query->ordered(),
            ])
            ->loadCount(['members', 'images']);
    }
}
