<?php

namespace Database\Factories;

use App\Models\Company;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Company>
 */
class CompanyFactory extends Factory
{
    public function definition(): array
    {
        $base_name = fake()->unique()->lastName().' '.fake()->randomElement([
            'Soft', 'Tech', 'Solutions', 'Digital', 'IT', 'Systems', 'Labs',
        ]);
        $domain = Str::slug($base_name).'.rs';

        return [
            'name' => $base_name.' d.o.o.',
            'tax_number' => fake()->unique()->numerify('1########'),
            'email' => 'info@'.$domain,
            'phone' => '+381 '.fake()->randomElement(['11', '21', '18', '34']).' '.fake()->numerify('###-####'),
            'website' => 'https://www.'.$domain,
            'address' => fake()->streetAddress(),
            'city' => fake()->city(),
            'description' => fake()->randomElement([
                'Razvoj veb i mobilnih aplikacija po meri.',
                'IT konsalting i outsourcing programera.',
                'Softverska resenja za finansijsku industriju.',
                'Digitalni marketing, dizajn i izrada sajtova.',
                'Sistemska integracija i odrzavanje IT infrastrukture.',
                'Razvoj ERP i CRM sistema za mala i srednja preduzeca.',
            ]),
        ];
    }
}
