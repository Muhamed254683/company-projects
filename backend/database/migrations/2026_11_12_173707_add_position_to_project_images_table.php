<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // position: redosled slike u galeriji svog projekta (1, 2, 3...); menja se prevlacenjem u aplikaciji.
        Schema::table('project_images', function (Blueprint $table) {
            $table->unsignedInteger('position')->default(0)->after('project_id');
            $table->index(['project_id', 'position']);
        });

        // Postojece slike dobijaju redosled kojim su do sada prikazivane (najnovija prva),
        // da se galerija ne "promesa" posle migracije.
        $project_ids = DB::table('project_images')->distinct()->pluck('project_id');

        foreach ($project_ids as $project_id) {
            $image_ids = DB::table('project_images')
                ->where('project_id', $project_id)
                ->orderByDesc('created_at')
                ->orderByDesc('id')
                ->pluck('id');

            foreach ($image_ids as $index => $image_id) {
                DB::table('project_images')->where('id', $image_id)->update(['position' => $index + 1]);
            }
        }
    }

    public function down(): void
    {
        Schema::table('project_images', function (Blueprint $table) {
            $table->dropIndex(['project_id', 'position']);
            $table->dropColumn('position');
        });
    }
};
