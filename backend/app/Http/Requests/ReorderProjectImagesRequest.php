<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

// PUT /api/projects/{project}/images/order   { "image_ids": [5, 2, 9] }  -> novi redosled galerije
class ReorderProjectImagesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'image_ids' => ['required', 'array', 'min:1'],
            'image_ids.*' => ['required', 'integer', 'distinct'],
        ];
    }

    /**
     * Posle osnovnih pravila: lista mora da sadrzi TACNO sve slike ovog projekta (ni manje, ni vise, ni tudje).
     */
    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                $project = $this->route('project');
                $expected = $project->images()->pluck('id')->sort()->values()->all();
                $given = collect($this->input('image_ids'))->map(fn ($id) => (int) $id)->sort()->values()->all();

                if ($expected !== $given) {
                    $validator->errors()->add('image_ids', 'The list must contain exactly all images of this project.');
                }
            },
        ];
    }
}
