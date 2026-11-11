<?php

namespace App\Http\Requests;

use App\Enums\ProjectRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AddProjectMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $project = $this->route('project');

        return [
            'user_id' => [
                'required',
                'integer',
                'exists:users,id',
                // Korisnik ne sme vec biti clan OVOG projekta.
                Rule::unique('project_user', 'user_id')->where('project_id', $project->id),
            ],
            'role' => ['required', Rule::enum(ProjectRole::class)],
        ];
    }

    public function messages(): array
    {
        // Podrazumevana poruka "The user id has already been taken." bi zbunjivala.
        return [
            'user_id.unique' => 'This user is already a member of this project.',
        ];
    }
}
