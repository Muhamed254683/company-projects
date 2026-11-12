<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

// GET /api/companies?search=...&city=...&page=...&per_page=...
class ListCompaniesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:100'],
            'city' => ['nullable', 'string', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer'],
        ];
    }
}
