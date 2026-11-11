{{-- Upotreba: <x-status-badge :status="$project->status" />  ($status je App\Enums\ProjectStatus) --}}
@props(['status'])

<span {{ $attributes->merge(['class' => 'inline-block rounded-full px-2.5 py-0.5 text-xs font-medium '.$status->badgeClasses()]) }}>
    {{ $status->label() }}
</span>
