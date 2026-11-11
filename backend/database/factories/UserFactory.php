<?php

namespace Database\Factories;

use App\Models\Company;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $first_name = fake()->firstName();
        $last_name = fake()->lastName();

        return [
            'company_id' => Company::factory(),
            'first_name' => $first_name,
            'last_name' => $last_name,
            // npr. "marko.petrovic17@example.com" (Str::slug uklanja kvacice: c, s, z...)
            'email' => Str::slug($first_name.' '.$last_name, '.')
                .fake()->unique()->numberBetween(1, 9999).'@example.com',
            'phone' => '+381 6'.fake()->numberBetween(0, 6).' '.fake()->numerify('### ####'),
            'job_title' => fake()->randomElement([
                'Backend developer',
                'Frontend developer',
                'Full-stack developer',
                'UI/UX dizajner',
                'QA inzenjer',
                'Projekt menadzer',
                'DevOps inzenjer',
                'Poslovni analiticar',
            ]),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Korisnik koji nema glavnu kompaniju (npr. frilenser).
     */
    public function withoutCompany(): static
    {
        return $this->state(fn (array $attributes) => [
            'company_id' => null,
        ]);
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
