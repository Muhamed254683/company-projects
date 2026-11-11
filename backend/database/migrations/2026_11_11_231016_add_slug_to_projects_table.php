<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        // 1) Kolona privremeno sme biti prazna, jer postojeci projekti jos nemaju slug.
        Schema::table('projects', function (Blueprint $table) {
            $table->string('slug')->nullable()->after('name');
        });

        // 2) Popunjavamo slug za postojece projekte.
        //    Ne koristimo model Project, jer se model vremenom menja, a migracija mora uvek da radi isto.
        $used_slugs = [];

        DB::table('projects')->orderBy('id')->each(function ($project) use (&$used_slugs) {
            $base = Str::slug($project->name) ?: 'projekat';
            $slug = $base;
            $suffix = 2;

            while (in_array($slug, $used_slugs, true)) {
                $slug = "{$base}-{$suffix}";
                $suffix++;
            }

            $used_slugs[] = $slug;
            DB::table('projects')->where('id', $project->id)->update(['slug' => $slug]);
        });

        // 3) Sada svi imaju slug: kolona postaje obavezna i jedinstvena (javni URL /showcase/{slug}).
        Schema::table('projects', function (Blueprint $table) {
            $table->string('slug')->nullable(false)->change();
            $table->unique('slug');
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropUnique(['slug']);
            $table->dropColumn('slug');
        });
    }
};
