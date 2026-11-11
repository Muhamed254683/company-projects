<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class UserController extends Controller
{
    /**
     * GET /api/users?page=1&per_page=15&company_id=3
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $per_page = min(max($request->integer('per_page', 15), 1), 100);

        $users = User::with('company')
            ->withCount('projects')
            // Opcioni filter: samo korisnici jedne kompanije.
            ->when($request->filled('company_id'), fn ($query) => $query->where('company_id', $request->integer('company_id')))
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->paginate($per_page)
            // Da linkovi za sledecu stranu zadrze filter (&company_id=3).
            ->withQueryString();

        return UserResource::collection($users);
    }

    /**
     * POST /api/users
     */
    public function store(UserRequest $request): UserResource
    {
        $user = User::create($request->validated());

        return UserResource::make($user->load('company')->loadCount('projects'));
    }

    /**
     * GET /api/users/{user}
     */
    public function show(User $user): UserResource
    {
        return UserResource::make($user->load('company')->loadCount('projects'));
    }

    /**
     * PUT/PATCH /api/users/{user}
     */
    public function update(UserRequest $request, User $user): UserResource
    {
        $data = $request->validated();

        // Prazna lozinka znaci "ne menjaj je".
        if (empty($data['password'])) {
            unset($data['password']);
        }

        $user->update($data);

        return UserResource::make($user->load('company')->loadCount('projects'));
    }

    /**
     * DELETE /api/users/{user}
     */
    public function destroy(User $user): Response
    {
        // Clanstva u project_user se brisu sama (cascadeOnDelete u migraciji).
        $user->delete();

        return response()->noContent();
    }
}
