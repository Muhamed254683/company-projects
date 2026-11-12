<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReorderProjectImagesRequest;
use App\Http\Requests\UploadProjectImagesRequest;
use App\Http\Resources\ProjectImageResource;
use App\Models\Project;
use App\Models\ProjectImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Throwable;

class ProjectImageController extends Controller
{
    /**
     * POST /api/projects/{project}/images   (multipart/form-data, polje images[])
     */
    public function store(UploadProjectImagesRequest $request, Project $project): JsonResponse
    {
        $stored_paths = [];

        try {
            $images = DB::transaction(function () use ($request, $project, &$stored_paths) {
                $created = [];

                foreach ($request->file('images') as $file) {
                    // store() sam smisli nasumicno ime i vrati putanju, npr. projects/5/a8f3k...jpg
                    $path = $file->store("projects/{$project->id}", 'public');
                    $stored_paths[] = $path;

                    $created[] = $project->images()->create([
                        'path' => $path,
                        'original_name' => $file->getClientOriginalName(),
                        'mime_type' => $file->getMimeType(),
                        'size' => $file->getSize(),
                    ]);
                }

                return $created;
            });
        } catch (Throwable $exception) {
            // Ako upis u bazu pukne, baza se vrati (transakcija), ali fajlovi su vec na disku.
            // Brisemo ih, da ne ostanu "sirocici" za koje baza ne zna.
            Storage::disk('public')->delete($stored_paths);

            throw $exception;
        }

        return ProjectImageResource::collection($images)->response()->setStatusCode(201);
    }

    /**
     * PUT /api/projects/{project}/images/order   { "image_ids": [5, 2, 9] }
     * Novi redosled galerije: prva u listi dobija poziciju 1, druga 2...
     * ReorderProjectImagesRequest proverava da lista sadrzi tacno sve slike ovog projekta.
     */
    public function reorder(ReorderProjectImagesRequest $request, Project $project): AnonymousResourceCollection
    {
        DB::transaction(function () use ($request, $project) {
            foreach ($request->input('image_ids') as $index => $image_id) {
                $project->images()->whereKey($image_id)->update(['position' => $index + 1]);
            }
        });

        return ProjectImageResource::collection($project->images()->ordered()->get());
    }

    /**
     * DELETE /api/projects/{project}/images/{image}
     */
    public function destroy(Project $project, ProjectImage $image): Response
    {
        // ProjectImage::deleted (iz modela) brise fajl sa diska.
        $image->delete();

        return response()->noContent();
    }
}
