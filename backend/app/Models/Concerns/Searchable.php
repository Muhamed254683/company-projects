<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Builder;

/**
 * Pretraga po vise kolona: Company::search('cacak', ['name', 'city'])->get().
 *
 * - Tekst se deli na reci; SVAKA rec mora da se nadje u bar jednoj koloni
 *   ("milin bolic" nalazi korisnika sa imenom "Milin" i prezimenom "Bolić").
 * - Mala/velika slova i kvacice (c/č/ć, s/š, z/ž) MySQL vec ne razlikuje (kolacija utf8mb4_unicode_ci),
 *   ali "đ" smatra posebnim slovom; zato se za "dj" trazi i varijanta sa "đ" ("djordjevic" -> "Đorđević").
 * - % i _ iz pretrage se traze doslovno (u SQL LIKE inace znace "bilo sta").
 */
trait Searchable
{
    public function scopeSearch(Builder $query, ?string $term, array $columns): Builder
    {
        $words = preg_split('/\s+/u', trim((string) $term), -1, PREG_SPLIT_NO_EMPTY);

        foreach ($words as $word) {
            $variants = array_unique([$word, str_ireplace('dj', 'đ', $word)]);

            // Zagrade: (kolona1 LIKE ... OR kolona2 LIKE ...) AND (... sledeca rec ...)
            $query->where(function (Builder $query) use ($columns, $variants) {
                foreach ($columns as $column) {
                    foreach ($variants as $variant) {
                        $query->orWhere($column, 'like', '%'.static::escapeLike($variant).'%');
                    }
                }
            });
        }

        return $query;
    }

    protected static function escapeLike(string $value): string
    {
        return str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $value);
    }
}
