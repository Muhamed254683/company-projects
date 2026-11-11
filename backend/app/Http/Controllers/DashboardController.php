<?php

namespace App\Http\Controllers;

use App\Enums\ProjectStatus;
use App\Models\Company;
use App\Models\Project;
use App\Models\User;
use Illuminate\View\View;

// GET /  -  Blade stranica; podatke uzima direktno iz baze (preko modela), ne preko API-ja.
class DashboardController extends Controller
{
    public function __invoke(): View
    {
        $projects_total = Project::count();

        // Jedan SQL upit: SELECT status, COUNT(*) ... GROUP BY status  ->  ['active' => 7, 'completed' => 4, ...]
        $counts_by_status = Project::query()
            ->selectRaw('status, COUNT(*) AS total')
            ->groupBy('status')
            ->pluck('total', 'status');

        // Svi statusi, i oni sa 0 projekata, u redosledu iz enuma.
        $projects_by_status = collect(ProjectStatus::cases())->map(fn (ProjectStatus $status) => [
            'status' => $status,
            'count' => (int) ($counts_by_status[$status->value] ?? 0),
            'percent' => $projects_total > 0
                ? round(($counts_by_status[$status->value] ?? 0) / $projects_total * 100)
                : 0,
        ]);

        $latest_projects = Project::with('company')
            ->withCount('members')
            ->latest()
            ->latest('id')
            ->take(5)
            ->get();

        return view('dashboard', [
            'companies_total' => Company::count(),
            'projects_total' => $projects_total,
            'users_total' => User::count(),
            'projects_by_status' => $projects_by_status,
            'latest_projects' => $latest_projects,
            'frontend_url' => config('app.frontend_url'),
        ]);
    }
}
