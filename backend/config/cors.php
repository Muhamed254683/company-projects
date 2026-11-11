<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    // Sanctum ne koristimo, pa je dovoljan samo API.
    'paths' => ['api/*'],

    'allowed_methods' => ['*'],

    // Samo nas React frontend sme da zove API iz browsera. Adrese su u .env (FRONTEND_URL),
    // odvojene zarezom, npr. http://localhost:5173,http://127.0.0.1:5173
    'allowed_origins' => array_map('trim', explode(',', env('FRONTEND_URL', 'http://localhost:5173'))),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
