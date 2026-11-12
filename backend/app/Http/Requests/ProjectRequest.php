<?php

namespace App\Http\Requests;

use App\Enums\ProjectStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Isti request se koristi i za kreiranje (POST) i za izmenu (PUT/PATCH).
 */
class ProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Pri izmeni ovde je projekat iz URL-a, a pri kreiranju null.
        $project = $this->route('project');

        return [
            'company_id' => ['required', 'integer', 'exists:companies,id'],
            'name' => [
                'required',
                'string',
                'max:255',
                // Ime mora biti jedinstveno samo u okviru iste kompanije.
                // Rule::unique gleda tabelu direktno, pa racuna i projekte u korpi: tako vracanje iz korpe
                // nikad ne pravi dva projekta istog imena.
                Rule::unique('projects', 'name')
                    ->where('company_id', $this->input('company_id'))
                    ->ignore($project),
            ],
            'description' => ['nullable', 'string', 'max:5000'],
            // Ako se ne posalje, ostaje podrazumevani 'planned'. Ako se posalje, mora biti iz enuma.
            'status' => ['sometimes', 'required', Rule::enum(ProjectStatus::class)],
            'start_date' => ['nullable', 'date'],
            // Poredimo sa start_date samo ako je on poslat.
            'end_date' => ['nullable', 'date', Rule::when($this->filled('start_date'), 'after_or_equal:start_date')],
            'budget' => ['nullable', 'numeric', 'decimal:0,2', 'min:0', 'max:9999999999.99'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.unique' => 'This company already has a project with this name (it may be in the trash).',
        ];
    }
}
