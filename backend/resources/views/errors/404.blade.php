{{-- Laravel automatski koristi ovaj fajl za svaku gresku 404 na web stranicama (API i dalje vraca JSON). --}}
@extends('layouts.app')

@section('title', 'Stranica ne postoji')

@section('content')
    <div class="rounded-lg bg-white p-10 text-center shadow-sm">
        <p class="text-5xl font-bold text-blue-700">404</p>
        <h1 class="mt-3 text-2xl font-bold">Stranica ne postoji</h1>
        <p class="mt-2 text-gray-600">Projekat ili stranica koju tražiš ne postoji ili je obrisana.</p>
        <a href="{{ route('dashboard') }}" class="mt-6 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Nazad na dashboard
        </a>
    </div>
@endsection
