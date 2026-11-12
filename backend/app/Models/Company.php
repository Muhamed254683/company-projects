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
        // Projekte kompanije brisemo TRAJNO (i one u korpi: withTrashed), preko Eloquent-a, jedan po jedan.
        // Tako se za svaki pokrene Project::forceDeleting i obrisu se njegove slike sa diska.
        // (Samo soft delete ne bi bio dovoljan: baza bi pri brisanju kompanije obrisala redove projekata,
        // a fajlovi slika bi ostali na disku.)
        static::deleting(function (Company $company) {
            $company->projects()->withTrashed()->each(fn (Project $project) => $project->forceDelete());
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
