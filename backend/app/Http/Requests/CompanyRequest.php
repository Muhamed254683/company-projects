<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Isti request se koristi i za kreiranje (POST) i za izmenu (PUT/PATCH).
 */
class CompanyRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Nemamo prijavu korisnika, pa svako sme da salje zahtev.
        return true;
    }

    public function rules(): array
    {
        // Pri izmeni ovde je kompanija iz URL-a, a pri kreiranju null.
        $company = $this->route('company');

        return [
            'name' => ['required', 'string', 'max:255'],
            // PIB mora biti jedinstven, ali pri izmeni ignorisemo samu tu kompaniju.
            'tax_number' => ['required', 'digits:9', Rule::unique('companies', 'tax_number')->ignore($company)],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'website' => ['nullable', 'url', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
