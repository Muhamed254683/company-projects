<?php

namespace App\Http\Requests;

use App\Enums\ProjectStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

// GET /api/projects?search=...&company_id=2&status=active
class ListProjectsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:100'],
            'company_id' => ['nullable', 'integer'],
            'status' => ['nullable', Rule::enum(ProjectStatus::class)],
            // trashed=only -> samo projekti u korpi
            'trashed' => ['nullable', Rule::in(['only'])],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer'],
        ];
    }
}
