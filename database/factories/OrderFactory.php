<?php

namespace Database\Factories;

use App\Enums\FranjaEntrega;
use App\Enums\OrderEstado;
use App\Models\Business;
use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'business_id' => Business::factory(),
            'numero' => sprintf('PED-%s-%04d', now()->year, fake()->unique()->numberBetween(1, 9999)),
            'fecha_entrega' => now()->addDays(fake()->numberBetween(1, 10))->toDateString(),
            'franja_entrega' => fake()->randomElement(FranjaEntrega::cases()),
            'estado' => OrderEstado::Pendiente,
            'subtotal' => '0.00',
            'descuento' => '0.00',
            'total' => '0.00',
            'observaciones' => null,
            'created_by' => null,
        ];
    }

    public function enEstado(OrderEstado $estado): static
    {
        return $this->state(fn (array $attributes) => ['estado' => $estado]);
    }

    public function entregado(): static
    {
        return $this->enEstado(OrderEstado::Entregado);
    }

    public function cancelado(): static
    {
        return $this->enEstado(OrderEstado::Cancelado);
    }
}
