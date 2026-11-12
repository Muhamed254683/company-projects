<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

#[Fillable(['project_id', 'path', 'original_name', 'mime_type', 'size'])]
class ProjectImage extends Model
{
    protected function casts(): array
    {
        return [
            'size' => 'integer',
            'position' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        // Nova slika ide na KRAJ galerije svog projekta.
        static::creating(function (ProjectImage $image) {
            if (empty($image->position)) {
                $last = static::where('project_id', $image->project_id)->max('position') ?? 0;
                $image->position = $last + 1;
            }
        });

        // Baza ne zna za fajlove na disku, pa fajl brisemo mi,
        // tek posto je red uspesno obrisan iz baze.
        static::deleted(function (ProjectImage $image) {
            Storage::disk('public')->delete($image->path);
        });
    }

    /**
     * Redosled iz galerije: ProjectImage::query()->ordered() ili $project->images()->ordered().
     * id je rezerva kada dve slike imaju istu poziciju.
     */
    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('position')->orderBy('id');
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
