<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

// GET /api/users?search=...&company_id=3 (ili company_id=none za korisnike bez kompanije)
class ListUsersRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:100'],
            // Broj (id kompanije) ili "none" (frilenseri).
            'company_id' => ['nullable', 'regex:/^(none|\d+)$/'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer'],
        ];
    }

    public function messages(): array
    {
        return [
            'company_id.regex' => 'The company id must be a company id or "none".',
        ];
    }
}
