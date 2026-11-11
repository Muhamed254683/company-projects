<?php

namespace App\Enums;

enum ProjectRole: string
{
    case Manager = 'manager';
    case Developer = 'developer';
    case Designer = 'designer';
    case Tester = 'tester';
}
