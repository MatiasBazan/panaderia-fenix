<?php

namespace Database\Factories;

use App\Enums\QuoteRequestEstado;
use App\Enums\TipoPedido;
use App\Models\QuoteRequest;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<QuoteRequest>
 */
class QuoteRequestFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nombre' => fake()->name(),
            'telefono' => fake()->numerify('351-###-####'),
            'tipo' => fake()->randomElement(TipoPedido::cases()),
            'localidad' => fake()->randomElement(['Córdoba', 'Villa Allende', 'Alta Gracia', null]),
            'mensaje' => fake()->boolean(60) ? fake()->sentence(12) : null,
            'fecha_evento' => fake()->boolean(50) ? fake()->dateTimeBetween('+3 days', '+2 months') : null,
            'estado' => QuoteRequestEstado::Nueva,
            'ip' => fake()->ipv4(),
        ];
    }

    public function enEstado(QuoteRequestEstado $estado): static
    {
        return $this->state(fn (array $attributes) => ['estado' => $estado]);
    }
}
