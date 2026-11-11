<?php

namespace Database\Factories;

use App\Enums\ProjectStatus;
use App\Models\Company;
use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Project>
 */
class ProjectFactory extends Factory
{
    private const TYPES = [
        'Veb prodavnica', 'Mobilna aplikacija', 'CRM sistem', 'ERP integracija', 'Redizajn sajta',
        'Interni portal', 'Sistem za rezervacije', 'Platforma za placanje', 'Analiticki dashboard', 'Migracija u cloud',
    ];

    private const CODE_NAMES = [
        'Alfa', 'Atlas', 'Orion', 'Feniks', 'Kometa', 'Vega', 'Polaris', 'Titan', 'Sirius', 'Delta',
        'Nova', 'Zenit', 'Pegaz', 'Lira', 'Kronos', 'Andromeda', 'Merkur', 'Iris', 'Hermes', 'Omega',
    ];

    private const TASKS = [
        'Analiza zahteva i izrada specifikacije.',
        'Razvoj backend API-ja i integracija sa postojecim sistemima.',
        'Izrada responzivnog korisnickog interfejsa.',
        'Migracija podataka iz starog sistema.',
        'Automatizovano testiranje i pustanje u produkciju.',
        'Obuka korisnika i odrzavanje nakon isporuke.',
    ];

    public function definition(): array
    {
        $start_date = fake()->dateTimeBetween('-1 year', '+2 months');
        $end_date = (clone $start_date)->modify('+'.fake()->numberBetween(2, 12).' months');

        return [
            'company_id' => Company::factory(),
            'name' => $this->uniqueName(),
            'description' => implode(' ', fake()->randomElements(self::TASKS, fake()->numberBetween(2, 3))),
            'status' => $this->statusFromDates($start_date, $end_date),
            'start_date' => $start_date,
            'end_date' => $end_date,
            'budget' => fake()->numberBetween(50, 5000) * 100,
        ];
    }

    /**
     * Jedinstveno ime "tip + kodno ime", npr. "CRM sistem Orion".
     * Jedinstveno mora biti CELO ime (10 tipova x 20 kodnih imena = 200 kombinacija), a ne samo kodno ime
     * (samo 20: posle 20 projekata Faker bi bacio OverflowException).
     * Kada se potrosi svih 200, dodaje se broj ("CRM sistem Orion 2"), pa factory nikad ne puca.
     */
    private function uniqueName(): string
    {
        static $used = [];

        $all_names = [];
        foreach (self::TYPES as $type) {
            foreach (self::CODE_NAMES as $code_name) {
                $all_names[] = "{$type} {$code_name}";
            }
        }

        $free = array_values(array_diff($all_names, array_keys($used)));
        $name = $free !== []
            ? fake()->randomElement($free)
            : fake()->randomElement($all_names).' '.(count($used) - count($all_names) + 2);

        $used[$name] = true;

        return $name;
    }

    /**
     * Status zavisi od datuma, da podaci budu logicni:
     * jos nije poceo => planned, prosao rok => completed, inace active ili on_hold.
     */
    private function statusFromDates(\DateTime $start_date, \DateTime $end_date): ProjectStatus
    {
        $now = new \DateTime;

        if ($start_date > $now) {
            return ProjectStatus::Planned;
        }

        if ($end_date < $now) {
            return ProjectStatus::Completed;
        }

        return fake()->boolean(80) ? ProjectStatus::Active : ProjectStatus::OnHold;
    }
}
