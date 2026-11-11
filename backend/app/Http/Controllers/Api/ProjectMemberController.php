<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AddProjectMemberRequest;
use App\Http\Resources\UserResource;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class ProjectMemberController extends Controller
{
    /**
     * GET /api/projects/{project}/members
     */
    public function index(Project $project): AnonymousResourceCollection
    {
        $members = $project->members()
            ->with('company')
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get();

        return UserResource::collection($members);
    }

    /**
     * POST /api/projects/{project}/members   body: {"user_id": 5, "role": "developer"}
     */
    public function store(AddProjectMemberRequest $request, Project $project): JsonResponse
    {
        $project->members()->attach($request->integer('user_id'), [
            'role' => $request->string('role')->toString(),
        ]);

        // Ucitavamo clana ponovo preko veze, da bi imao i pivot (role) i kompaniju.
        $member = $project->members()->with('company')->findOrFail($request->integer('user_id'));

        // 201 rucno, jer korisnik nije nov (postojao je i ranije), nova je samo veza.
        return UserResource::make($member)->response()->setStatusCode(201);
    }

    /**
     * DELETE /api/projects/{project}/members/{user}
     */
    public function destroy(Project $project, User $user): Response
    {
        abort_unless(
            $project->members()->whereKey($user->id)->exists(),
            404,
            'This user is not a member of this project.'
        );

        // detach() brise samo red iz project_user; korisnik i projekat ostaju.
        $project->members()->detach($user->id);

        return response()->noContent();
    }
}
