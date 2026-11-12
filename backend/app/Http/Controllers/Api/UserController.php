<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ListUsersRequest;
use App\Http\Requests\UserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class UserController extends Controller
{
    /**
     * GET /api/users?page=1&per_page=15&search=milin&company_id=3   (company_id=none -> bez kompanije)
     */
    public function index(ListUsersRequest $request): AnonymousResourceCollection
    {
        $per_page = min(max($request->integer('per_page', 15), 1), 100);
        $company_id = $request->input('company_id');

        $users = User::with('company')
            ->withCount('projects')
            ->search($request->input('search'), ['first_name', 'last_name', 'email', 'job_title'])
            // Opcioni filter: korisnici jedne kompanije, ili "none" = frilenseri (bez kompanije).
            ->when($company_id === 'none', fn ($query) => $query->whereNull('company_id'))
            ->when(ctype_digit((string) $company_id), fn ($query) => $query->where('company_id', (int) $company_id))
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
    public function destroy(Request $request, User $user): Response
    {
        // Prijavljeni korisnik ne moze da obrise sam sebe (ostao bi prijavljen sa nepostojecim nalogom).
        abort_if($request->user()->id === $user->id, 403, 'You cannot delete your own account.');

        // Clanstva u project_user i tokeni za prijavu brisu se sami (cascade / Sanctum).
        $user->tokens()->delete();
        $user->delete();

        return response()->noContent();
    }
}
