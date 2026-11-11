<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Isti request se koristi i za kreiranje (POST) i za izmenu (PUT/PATCH).
 */
class UserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Pri izmeni ovde je korisnik iz URL-a, a pri kreiranju null.
        $user = $this->route('user');
        $is_create = $user === null;

        return [
            // null = korisnik bez kompanije (frilenser).
            'company_id' => ['nullable', 'integer', 'exists:companies,id'],
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user)],
            'phone' => ['nullable', 'string', 'max:30'],
            'job_title' => ['nullable', 'string', 'max:100'],
            // Pri kreiranju je obavezna; pri izmeni samo ako zelimo da je promenimo.
            'password' => [$is_create ? 'required' : 'nullable', 'string', 'min:8', 'max:255'],
        ];
    }
}
