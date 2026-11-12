<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\ProjectImage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

// Sortiranje slika u galeriji projekta (kolona position).
class ImageOrderTest extends TestCase
{
    use RefreshDatabase;

    private function image(Project $project, string $name): ProjectImage
    {
        return $project->images()->create([
            'path' => "projects/{$project->id}/{$name}",
            'original_name' => $name,
            'mime_type' => 'image/png',
            'size' => 100,
        ]);
    }

    public function test_new_images_go_to_the_end(): void
    {
        $project = Project::factory()->create();

        $first = $this->image($project, 'a.png');
        $second = $this->image($project, 'b.png');
        $third = $this->image($project, 'c.png');

        $this->assertSame([1, 2, 3], [$first->position, $second->position, $third->position]);
        // Pozicije se racunaju posebno za svaki projekat.
        $this->assertSame(1, $this->image(Project::factory()->create(), 'x.png')->position);
    }

    public function test_reorder_saves_new_order_everywhere(): void
    {
        $this->withoutVite();
        $project = Project::factory()->create();
        [$a, $b, $c] = [$this->image($project, 'a.png'), $this->image($project, 'b.png'), $this->image($project, 'c.png')];

        $response = $this->putJson("/api/projects/{$project->id}/images/order", ['image_ids' => [$c->id, $a->id, $b->id]]);

        $response->assertOk();
        $this->assertSame([$c->id, $a->id, $b->id], array_column($response->json('data'), 'id'));
        $this->assertSame([1, 2, 3], array_column($response->json('data'), 'position'));

        // API detalja projekta vraca isti redosled...
        $this->assertSame([$c->id, $a->id, $b->id], array_column($this->getJson("/api/projects/{$project->id}")->json('data.images'), 'id'));
        // ...i javna Blade stranica.
        $this->get("/showcase/{$project->slug}")->assertOk()->assertSeeInOrder(['c.png', 'a.png', 'b.png'], false);
    }

    public function test_list_must_contain_exactly_all_images_of_the_project(): void
    {
        $project = Project::factory()->create();
        [$a, $b] = [$this->image($project, 'a.png'), $this->image($project, 'b.png')];
        $foreign = $this->image(Project::factory()->create(), 'tudja.png');
        $url = "/api/projects/{$project->id}/images/order";
        $message = 'The list must contain exactly all images of this project.';

        // Nedostaje slika.
        $this->putJson($url, ['image_ids' => [$a->id]])->assertUnprocessable()->assertJsonPath('errors.image_ids.0', $message);
        // Tudja slika umesto nase.
        $this->putJson($url, ['image_ids' => [$a->id, $foreign->id]])->assertUnprocessable()->assertJsonPath('errors.image_ids.0', $message);
        // Ista slika dvaput.
        $this->putJson($url, ['image_ids' => [$a->id, $a->id]])->assertUnprocessable()->assertJsonValidationErrors('image_ids.0');
        // Prazno.
        $this->putJson($url, ['image_ids' => []])->assertUnprocessable()->assertJsonValidationErrors('image_ids');

        // Redosled se nije promenio.
        $this->assertSame([1, 2], [$a->fresh()->position, $b->fresh()->position]);
        $this->assertSame(1, $foreign->fresh()->position);
    }

    public function test_deleting_an_image_keeps_order_of_the_rest(): void
    {
        $project = Project::factory()->create();
        [$a, $b, $c] = [$this->image($project, 'a.png'), $this->image($project, 'b.png'), $this->image($project, 'c.png')];

        $this->deleteJson("/api/projects/{$project->id}/images/{$b->id}")->assertNoContent();
        $d = $this->image($project, 'd.png');

        $this->assertSame([$a->id, $c->id, $d->id], $project->images()->ordered()->pluck('id')->all());
    }
}
