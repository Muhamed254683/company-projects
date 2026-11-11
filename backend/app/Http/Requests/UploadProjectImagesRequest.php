<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\File;

class UploadProjectImagesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Polje "images[]" u multipart/form-data zahtevu: jedna ili vise slika.
            'images' => ['required', 'array', 'min:1', 'max:10'],
            'images.*' => [
                'required',
                // Tip se proverava po SADRZAJU fajla, ne po ekstenziji.
                // 2 MB jer PHP (upload_max_filesize u php.ini) ionako ne prima vece fajlove.
                File::image()->types(['jpg', 'jpeg', 'png', 'webp'])->max(2 * 1024),
            ],
        ];
    }
}
