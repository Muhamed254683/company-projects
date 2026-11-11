<?php

namespace App\Enums;

enum ProjectStatus: string
{
    case Planned = 'planned';
    case Active = 'active';
    case OnHold = 'on_hold';
    case Completed = 'completed';

    // Naziv za prikaz u Blade stranicama (isti kao u React aplikaciji, frontend/src/constants/projectStatus.js).
    public function label(): string
    {
        return match ($this) {
            self::Planned => 'Planiran',
            self::Active => 'Aktivan',
            self::OnHold => 'Na čekanju',
            self::Completed => 'Završen',
        };
    }

    // Tailwind klase za obojeni bedz.
    public function badgeClasses(): string
    {
        return match ($this) {
            self::Planned => 'bg-gray-100 text-gray-700',
            self::Active => 'bg-green-100 text-green-800',
            self::OnHold => 'bg-yellow-100 text-yellow-800',
            self::Completed => 'bg-blue-100 text-blue-800',
        };
    }

    // Boja trake na dashboard-u.
    public function barClasses(): string
    {
        return match ($this) {
            self::Planned => 'bg-gray-400',
            self::Active => 'bg-green-500',
            self::OnHold => 'bg-yellow-400',
            self::Completed => 'bg-blue-500',
        };
    }
}
