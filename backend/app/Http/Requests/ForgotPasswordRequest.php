<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

// POST /api/forgot-password  { email }
class ForgotPasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Namerno NEMA "exists:users": odgovor mora biti isti i za email koji ne postoji.
            'email' => ['required', 'email', 'max:255'],
        ];
    }
}
