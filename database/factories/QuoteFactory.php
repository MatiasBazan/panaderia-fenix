<?php

namespace Database\Factories;

use App\Enums\QuoteEstado;
use App\Models\Quote;
use App\Models\QuoteRequest;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Quote>
 */
class QuoteFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'quote_request_id' => QuoteRequest::factory(),
            'numero' => sprintf('COT-%s-%04d', now()->year, fake()->unique()->numberBetween(1, 9999)),
            'subtotal' => '0.00',
            'descuento' => '0.00',
            'total' => '0.00',
            'vence_el' => now()->addDays(15)->toDateString(),
            'observaciones' => null,
            'estado' => QuoteEstado::Borrador,
            'enviada_el' => null,
            'created_by' => null,
        ];
    }

    public function enviada(): static
    {
        return $this->state(fn (array $attributes) => [
            'estado' => QuoteEstado::Enviada,
            'enviada_el' => now(),
        ]);
    }

    public function vencida(): static
    {
        return $this->state(fn (array $attributes) => [
            'estado' => QuoteEstado::Vencida,
            'vence_el' => now()->subDay()->toDateString(),
        ]);
    }
}
