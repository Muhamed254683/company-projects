<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

// POST /api/register  { first_name, last_name, email, password, password_confirmation }
class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            // "confirmed": mora da postoji i polje password_confirmation sa istom vrednoscu.
            'password' => ['required', 'string', 'min:8', 'max:255', 'confirmed'],
        ];
    }
}
