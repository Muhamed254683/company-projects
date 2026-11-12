<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\ProjectImageController;
use App\Http\Controllers\Api\ProjectMemberController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

// Sve rute ovde automatski dobijaju prefiks /api (npr. /api/companies).

// Prijava je jedina ruta bez tokena. throttle:login = najvise 5 pokusaja u minuti (AppServiceProvider).
Route::post('login', [AuthController::class, 'login'])->middleware('throttle:login');

// Sve ostalo trazi prijavu: zahtev mora da ima "Authorization: Bearer <token>", inace 401.
Route::middleware('auth:sanctum')->group(function () {
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('me', [AuthController::class, 'me']);

    Route::apiResource('companies', CompanyController::class);
    Route::apiResource('users', UserController::class);
    Route::apiResource('projects', ProjectController::class);

    // Korpa (soft delete). withTrashed(): Laravel pronalazi i projekat koji je u korpi (inace bi vratio 404).
    Route::post('projects/{project}/restore', [ProjectController::class, 'restore'])->withTrashed();
    Route::delete('projects/{project}/force', [ProjectController::class, 'forceDestroy'])->withTrashed();

    // Clanovi projekta (ugnezdene rute: clan uvek pripada nekom projektu).
    Route::get('projects/{project}/members', [ProjectMemberController::class, 'index']);
    Route::post('projects/{project}/members', [ProjectMemberController::class, 'store']);
    Route::delete('projects/{project}/members/{user}', [ProjectMemberController::class, 'destroy']);

    // Slike projekta. scopeBindings: slika MORA pripadati projektu iz URL-a, inace 404.
    Route::post('projects/{project}/images', [ProjectImageController::class, 'store']);
    Route::delete('projects/{project}/images/{image}', [ProjectImageController::class, 'destroy'])->scopeBindings();
});
