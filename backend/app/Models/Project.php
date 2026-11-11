<?php

namespace App\Models;

use App\Enums\ProjectStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

#[Fillable(['company_id', 'name', 'description', 'status', 'start_date', 'end_date', 'budget'])]
class Project extends Model
{
    use HasFactory;

    protected $attributes = [
        'status' => 'planned',
    ];

    protected function casts(): array
    {
        return [
            'status' => ProjectStatus::class,
            'start_date' => 'date',
            'end_date' => 'date',
            'budget' => 'decimal:2',
        ];
    }

    protected static function booted(): void
    {
        // Slug (za javni URL /showcase/{slug}) pravimo sami iz naziva, samo pri KREIRANJU.
        // Pri izmeni naziva slug ostaje isti, da stari (podeljeni) linkovi ne bi prestali da rade.
        static::creating(function (Project $project) {
            if (empty($project->slug)) {
                $project->slug = static::uniqueSlug($project->name);
            }
        });

        // Slike brisemo preko Eloquent-a, jednu po jednu,
        // da bi se za svaku pokrenuo ProjectImage::deleted i obrisao fajl sa diska.
        static::deleting(function (Project $project) {
            $project->images()->each(fn (ProjectImage $image) => $image->delete());
        });
    }

    /**
     * "CRM sistem Iris" -> "crm-sistem-iris"; ako je zauzet: "crm-sistem-iris-2", "-3"...
     */
    public static function uniqueSlug(string $name): string
    {
        $base = Str::slug($name) ?: 'projekat';
        $slug = $base;
        $suffix = 2;

        while (static::where('slug', $slug)->exists()) {
            $slug = "{$base}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class)
            ->withPivot('role')
            ->withTimestamps();
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProjectImage::class);
    }
}
