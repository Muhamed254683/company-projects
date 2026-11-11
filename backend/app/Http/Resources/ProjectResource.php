<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'company_id' => $this->company_id,
            'name' => $this->name,
            'description' => $this->description,
            'status' => $this->status->value,
            // Samo datum (2026-11-11), bez vremena, jer su kolone tipa date.
            'start_date' => $this->start_date?->toDateString(),
            'end_date' => $this->end_date?->toDateString(),
            'budget' => $this->budget,
            'company' => CompanyResource::make($this->whenLoaded('company')),
            'members' => UserResource::collection($this->whenLoaded('members')),
            'images' => ProjectImageResource::collection($this->whenLoaded('images')),
            'members_count' => $this->whenCounted('members'),
            'images_count' => $this->whenCounted('images'),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
