<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\View\View;

// GET /showcase/{slug}  -  javna Blade stranica jednog projekta.
// Laravel sam pronalazi projekat po slug-u (ruta {project:slug}); ako ne postoji, vraca 404.
class ShowcaseController extends Controller
{
    public function __invoke(Project $project): View
    {
        $project->load([
            'company',
            'members' => fn ($query) => $query->with('company')->orderBy('last_name')->orderBy('first_name'),
            'images' => fn ($query) => $query->latest()->latest('id'),
        ]);

        return view('showcase', [
            'project' => $project,
            'frontend_url' => config('app.frontend_url'),
        ]);
    }
}
