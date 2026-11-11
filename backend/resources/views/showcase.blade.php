@extends('layouts.app')

@use('App\Enums\ProjectRole')
@use('Illuminate\Support\Facades\Storage')

@section('title', $project->name)

@section('content')
    {{-- Zaglavlje projekta --}}
    <section class="rounded-lg bg-white p-6 shadow-sm">
        <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
                <p class="text-sm font-medium text-blue-700">{{ $project->company->name }}</p>
                <h1 class="mt-1 text-3xl font-bold text-gray-900">{{ $project->name }}</h1>
            </div>
            <x-status-badge :status="$project->status" />
        </div>

        <dl class="mt-6 grid gap-4 border-t border-gray-100 pt-4 text-sm sm:grid-cols-3">
            <div>
                <dt class="text-gray-500">Kompanija</dt>
                <dd class="mt-1 font-medium">
                    {{ $project->company->name }}
                    @if ($project->company->city)
                        <span class="block text-gray-500">{{ $project->company->city }}</span>
                    @endif
                    @if ($project->company->website)
                        <a href="{{ $project->company->website }}" class="text-blue-700 hover:underline" rel="noopener" target="_blank">
                            {{ preg_replace('#^https?://#', '', $project->company->website) }}
                        </a>
                    @endif
                </dd>
            </div>
            <div>
                <dt class="text-gray-500">Period</dt>
                <dd class="mt-1 font-medium">
                    {{ $project->start_date?->format('d.m.Y.') ?? '–' }} – {{ $project->end_date?->format('d.m.Y.') ?? '–' }}
                </dd>
            </div>
            <div>
                <dt class="text-gray-500">Tim</dt>
                <dd class="mt-1 font-medium">{{ $project->members->count() }} {{ $project->members->count() === 1 ? 'član' : 'članova' }}</dd>
            </div>
        </dl>

        @if ($project->description)
            {{-- {{ }} automatski "escape-uje" tekst (zastita od XSS); whitespace-pre-line cuva nove redove. --}}
            <p class="mt-6 whitespace-pre-line leading-relaxed text-gray-700">{{ $project->description }}</p>
        @endif
    </section>

    <div class="mt-6 grid gap-6 lg:grid-cols-3">
        {{-- Galerija --}}
        <section class="lg:col-span-2">
            <h2 class="text-xl font-semibold">Galerija ({{ $project->images->count() }})</h2>

            @if ($project->images->isEmpty())
                <p class="mt-3 rounded-lg bg-white p-8 text-center text-sm text-gray-500 shadow-sm">Projekat još nema slika.</p>
            @else
                <ul class="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
                    @foreach ($project->images as $image)
                        <li class="overflow-hidden rounded-lg bg-white shadow-sm">
                            <a href="{{ Storage::disk('public')->url($image->path) }}" target="_blank" title="Otvori u punoj veličini">
                                <img src="{{ Storage::disk('public')->url($image->path) }}" alt="{{ $image->original_name }}"
                                     loading="lazy" class="aspect-square w-full bg-gray-100 object-cover transition hover:opacity-90">
                            </a>
                        </li>
                    @endforeach
                </ul>
            @endif
        </section>

        {{-- Tim --}}
        <section>
            <h2 class="text-xl font-semibold">Tim</h2>

            @if ($project->members->isEmpty())
                <p class="mt-3 rounded-lg bg-white p-6 text-center text-sm text-gray-500 shadow-sm">Projekat još nema članova.</p>
            @else
                <ul class="mt-3 divide-y divide-gray-100 rounded-lg bg-white shadow-sm">
                    @foreach ($project->members as $member)
                        {{-- Clan je "spoljni" ako nije iz kompanije kojoj projekat pripada (druga firma ili frilenser). --}}
                        @php($is_external = $member->company_id !== $project->company_id)

                        <li @class(['flex items-start justify-between gap-3 p-4', 'bg-amber-50' => $is_external]) data-member="{{ $member->id }}">
                            <div class="min-w-0">
                                <p class="font-medium text-gray-900">{{ $member->full_name }}</p>
                                <p class="text-xs text-gray-500">
                                    {{ $member->job_title ?? '–' }} · {{ $member->company?->name ?? 'bez kompanije' }}
                                </p>
                                @if ($is_external)
                                    <span class="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                                        {{ $member->company_id === null ? 'Frilenser' : 'Druga firma' }}
                                    </span>
                                @endif
                            </div>
                            <span class="shrink-0 rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                                {{ ProjectRole::tryFrom($member->pivot->role)?->label() ?? $member->pivot->role }}
                            </span>
                        </li>
                    @endforeach
                </ul>
                <p class="mt-2 text-xs text-gray-500">Žuto: član iz druge firme ili frilenser.</p>
            @endif
        </section>
    </div>

    <p class="mt-8 flex flex-wrap gap-4 text-sm">
        <a href="{{ route('dashboard') }}" class="text-blue-700 hover:underline">‹ Nazad na dashboard</a>
        <a href="{{ $frontend_url }}/projects/{{ $project->id }}" class="text-blue-700 hover:underline">Uredi u aplikaciji ↗</a>
    </p>
@endsection
