<?php

use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\ProjectImageController;
use App\Http\Controllers\Api\ProjectMemberController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

// Sve rute ovde automatski dobijaju prefiks /api (npr. /api/companies).
Route::apiResource('companies', CompanyController::class);
Route::apiResource('users', UserController::class);
Route::apiResource('projects', ProjectController::class);

// Clanovi projekta (ugnezdene rute: clan uvek pripada nekom projektu).
Route::get('projects/{project}/members', [ProjectMemberController::class, 'index']);
Route::post('projects/{project}/members', [ProjectMemberController::class, 'store']);
Route::delete('projects/{project}/members/{user}', [ProjectMemberController::class, 'destroy']);

// Slike projekta. scopeBindings: slika MORA pripadati projektu iz URL-a, inace 404.
Route::post('projects/{project}/images', [ProjectImageController::class, 'store']);
Route::delete('projects/{project}/images/{image}', [ProjectImageController::class, 'destroy'])->scopeBindings();
