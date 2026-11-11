<!DOCTYPE html>
<html lang="sr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    {{-- Svaka stranica moze da postavi svoj naslov sa @section('title', '...'). --}}
    <title>@yield('title', 'Dashboard') · Company Projects</title>
    <link rel="icon" type="image/svg+xml" href="{{ asset('favicon.svg') }}">

    {{-- Tailwind CSS preko Vite-a (resources/css/app.css). Pre prvog otvaranja: npm run build. --}}
    @vite(['resources/css/app.css'])
</head>
<body class="flex min-h-screen flex-col bg-gray-100 text-gray-800 antialiased">
    <header class="bg-blue-700 shadow">
        <nav class="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
            <a href="{{ route('dashboard') }}" class="text-lg font-bold text-white">Company Projects</a>

            <div class="flex items-center gap-2 text-sm font-medium">
                <a href="{{ route('dashboard') }}"
                   class="rounded-md px-3 py-2 {{ request()->routeIs('dashboard') ? 'bg-white text-blue-700' : 'text-blue-100 hover:bg-blue-600 hover:text-white' }}">
                    Dashboard
                </a>
                <a href="{{ config('app.frontend_url') }}" class="rounded-md px-3 py-2 text-blue-100 hover:bg-blue-600 hover:text-white">
                    Otvori aplikaciju ↗
                </a>
            </div>
        </nav>
    </header>

    <main class="mx-auto w-full max-w-6xl flex-1 p-6">
        {{-- Ovde svaka stranica ubacuje svoj sadrzaj (@section('content')). --}}
        @yield('content')
    </main>

    <footer class="border-t border-gray-200 bg-white">
        <p class="mx-auto max-w-6xl px-6 py-4 text-xs text-gray-500">
            Company Projects · stranicu je napravio Laravel (Blade) direktno iz baze
        </p>
    </footer>
</body>
</html>
