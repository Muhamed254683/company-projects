<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
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
        ];
    }

    protected static function booted(): void
    {
        // Baza ne zna za fajlove na disku, pa fajl brisemo mi,
        // tek posto je red uspesno obrisan iz baze.
        static::deleted(function (ProjectImage $image) {
            Storage::disk('public')->delete($image->path);
        });
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
