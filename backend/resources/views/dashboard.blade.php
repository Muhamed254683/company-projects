@extends('layouts.app')

@section('title', 'Dashboard')

@section('content')
    <h1 class="text-2xl font-bold">Dashboard</h1>
    <p class="mt-1 text-sm text-gray-600">Pregled podataka u bazi.</p>

    {{-- 1) Ukupni brojevi --}}
    <section class="mt-6 grid gap-4 sm:grid-cols-3">
        @foreach ([
            ['label' => 'Kompanije', 'value' => $companies_total, 'path' => '/companies'],
            ['label' => 'Projekti', 'value' => $projects_total, 'path' => '/projects'],
            ['label' => 'Korisnici', 'value' => $users_total, 'path' => '/users'],
        ] as $card)
            <div class="rounded-lg bg-white p-5 shadow-sm">
                <p class="text-sm font-medium text-gray-500">{{ $card['label'] }}</p>
                <p class="mt-1 text-3xl font-bold text-gray-900" data-stat="{{ $card['path'] }}">{{ $card['value'] }}</p>
                <a href="{{ $frontend_url.$card['path'] }}" class="mt-2 inline-block text-sm text-blue-700 hover:underline">
                    Otvori listu ↗
                </a>
            </div>
        @endforeach
    </section>

    <div class="mt-6 grid gap-6 lg:grid-cols-3">
        {{-- 2) Projekti po statusu --}}
        <section class="rounded-lg bg-white p-5 shadow-sm">
            <h2 class="text-lg font-semibold">Projekti po statusu</h2>

            <ul class="mt-4 space-y-4">
                @foreach ($projects_by_status as $row)
                    <li data-status="{{ $row['status']->value }}">
                        <div class="flex items-center justify-between text-sm">
                            <x-status-badge :status="$row['status']" />
                            <span class="text-gray-700"><strong>{{ $row['count'] }}</strong> ({{ $row['percent'] }}%)</span>
                        </div>
                        <div class="mt-1.5 h-2 overflow-hidden rounded-full bg-gray-100">
                            <div class="h-full rounded-full {{ $row['status']->barClasses() }}" style="width: {{ $row['percent'] }}%"></div>
                        </div>
                    </li>
                @endforeach
            </ul>
        </section>

        {{-- 3) Poslednji projekti --}}
        <section class="overflow-hidden rounded-lg bg-white shadow-sm lg:col-span-2">
            <h2 class="px-5 pt-5 text-lg font-semibold">Poslednji projekti</h2>

            @if ($latest_projects->isEmpty())
                <p class="p-5 text-sm text-gray-500">Još nema projekata.</p>
            @else
                <div class="mt-3 overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200 text-sm">
                        <thead class="bg-gray-50 text-left text-gray-700">
                            <tr>
                                <th class="px-5 py-2 font-semibold">Naziv</th>
                                <th class="px-5 py-2 font-semibold">Status</th>
                                <th class="px-5 py-2 font-semibold">Rok</th>
                                <th class="px-5 py-2 text-center font-semibold">Tim</th>
                                <th class="px-5 py-2"></th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            @foreach ($latest_projects as $project)
                                <tr>
                                    <td class="px-5 py-3">
                                        <a href="{{ route('showcase', $project) }}" class="font-medium text-blue-700 hover:underline">{{ $project->name }}</a>
                                        <span class="block text-xs text-gray-500">{{ $project->company->name }}</span>
                                    </td>
                                    <td class="px-5 py-3"><x-status-badge :status="$project->status" /></td>
                                    <td class="whitespace-nowrap px-5 py-3">{{ $project->end_date?->format('d.m.Y.') ?? '–' }}</td>
                                    <td class="px-5 py-3 text-center">{{ $project->members_count }}</td>
                                    <td class="whitespace-nowrap px-5 py-3 text-right">
                                        <a href="{{ $frontend_url }}/projects/{{ $project->id }}" class="text-blue-700 hover:underline">Uredi ↗</a>
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            @endif
        </section>
    </div>
@endsection
