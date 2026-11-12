<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

// POST /api/reset-password  { token, email, password, password_confirmation }
// token i email stizu iz linka u emailu.
class ResetPasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'token' => ['required', 'string'],
            'email' => ['required', 'email', 'max:255'],
            // Ista pravila kao kod registracije; "confirmed" trazi i password_confirmation.
            'password' => ['required', 'string', 'min:8', 'max:255', 'confirmed'],
        ];
    }
}
