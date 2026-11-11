<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // Lozinku i remember_token namerno NE vracamo.
        return [
            'id' => $this->id,
            'company_id' => $this->company_id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'full_name' => $this->full_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'job_title' => $this->job_title,
            // Samo kada je korisnik ucitan kao clan projekta (preko project_user).
            'role' => $this->whenPivotLoaded('project_user', fn () => $this->pivot->role),
            // Pojavljuje se samo ako je kontroler ucitao vezu sa with()/load().
            'company' => CompanyResource::make($this->whenLoaded('company')),
            'projects_count' => $this->whenCounted('projects'),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
