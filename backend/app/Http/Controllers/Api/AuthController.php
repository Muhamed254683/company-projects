<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ForgotPasswordRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\ResetPasswordRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
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
     * POST /api/register  -> { token, user }  (201)
     * Otvorena registracija: svako moze da napravi nalog i odmah je prijavljen.
     * Kompanija se ne bira ovde (lista kompanija je samo za prijavljene); podesava se kasnije kroz "Izmeni".
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'first_name' => $request->input('first_name'),
            'last_name' => $request->input('last_name'),
            'email' => $request->input('email'),
            // Model sam hesira lozinku ('password' => 'hashed' u casts()).
            'password' => $request->input('password'),
        ]);

        $token = $user->createToken('react')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => UserResource::make($user->load('company')),
        ], 201);
    }

    /**
     * POST /api/forgot-password  -> salje email sa linkom za novu lozinku.
     * Laravel pravi jednokratni token (u bazi je samo njegov hes, tabela password_reset_tokens), vazi 60 minuta.
     * Odgovor je ISTI i kada email ne postoji, da niko ne moze da proverava koji nalozi postoje.
     */
    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        Password::sendResetLink($request->only('email'));

        return response()->json([
            'message' => 'If an account with that email exists, we have sent a password reset link.',
        ]);
    }

    /**
     * POST /api/reset-password  -> postavlja novu lozinku (token i email su iz linka).
     * Posle promene se brisu SVI tokeni korisnika: odjavljen je sa svih uredjaja i mora ponovo da se prijavi.
     */
    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                // Model sam hesira lozinku ('password' => 'hashed' u casts()).
                $user->forceFill(['password' => $password])->save();
                $user->tokens()->delete();
                event(new PasswordReset($user));
            },
        );

        // Ista poruka za los token, istekao link i nepostojeci email.
        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => ['This password reset link is invalid or has expired.'],
            ]);
        }

        return response()->json(['message' => 'Your password has been reset.']);
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
