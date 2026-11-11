<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ShowcaseController;
use Illuminate\Support\Facades\Route;

// Blade stranice: Laravel ih pravi direktno iz baze (ne preko API-ja).
Route::get('/', DashboardController::class)->name('dashboard');

// {project:slug}: projekat se trazi po koloni "slug" (a ne po id-ju); ako ga nema -> 404.
Route::get('/showcase/{project:slug}', ShowcaseController::class)->name('showcase');
