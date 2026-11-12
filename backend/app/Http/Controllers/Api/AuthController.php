<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

// Prijava preko Sanctum tokena: React salje token uz svaki zahtev (Authorization: Bearer <token>).
class AuthController extends Controller
{
    /**
     * POST /api/login  -> { token, user }
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->input('email'))->first();

        // Ista poruka i za nepostojeci email i za pogresnu lozinku: napadac ne sme da sazna koji emailovi postoje.
        if (! $user || ! Hash::check($request->input('password'), $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The email or password is incorrect.'],
            ]);
        }

        // Novi token za ovu prijavu; u bazi se cuva samo njegov hes (tabela personal_access_tokens).
        $token = $user->createToken('react')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => UserResource::make($user->load('company')),
        ]);
    }

    /**
     * POST /api/logout  -> brise SAMO token kojim je poslat ovaj zahtev (druge prijave ostaju).
     */
    public function logout(Request $request): Response
    {
        $request->user()->currentAccessToken()->delete();

        return response()->noContent();
    }

    /**
     * GET /api/me  -> trenutno prijavljeni korisnik
     */
    public function me(Request $request): UserResource
    {
        return UserResource::make($request->user()->load('company'));
    }
}
