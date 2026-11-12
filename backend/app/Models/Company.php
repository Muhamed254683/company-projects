<?php

namespace App\Models;

use App\Models\Concerns\Searchable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'tax_number', 'email', 'phone', 'website', 'address', 'city', 'description'])]
class Company extends Model
{
    use HasFactory, Searchable;

    protected static function booted(): void
    {
        // Projekte brisemo preko Eloquent-a, jedan po jedan, a ne samo preko baze (cascade).
        // Tako se za svaki projekat pokrene Project::deleting i obrisu se njegove slike sa diska.
        static::deleting(function (Company $company) {
            $company->projects()->each(fn (Project $project) => $project->delete());
        });
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }
}
