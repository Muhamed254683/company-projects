<?php

namespace App\Enums;

enum ProjectRole: string
{
    case Manager = 'manager';
    case Developer = 'developer';
    case Designer = 'designer';
    case Tester = 'tester';

    // Naziv za prikaz u Blade stranicama (isti kao u React aplikaciji, frontend/src/constants/projectRoles.js).
    public function label(): string
    {
        return match ($this) {
            self::Manager => 'Menadžer',
            self::Developer => 'Developer',
            self::Designer => 'Dizajner',
            self::Tester => 'Tester',
        };
    }
}
