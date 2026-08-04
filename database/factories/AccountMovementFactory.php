<?php

namespace Database\Factories;

use App\Enums\MovementTipo;
use App\Models\AccountMovement;
use App\Models\Business;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AccountMovement>
 */
class AccountMovementFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'business_id' => Business::factory(),
            'tipo' => MovementTipo::Debito,
            'concepto' => 'Ajuste',
            'order_id' => null,
            'monto' => fake()->randomFloat(2, 1000, 200000),
            'fecha' => now()->toDateString(),
            'created_by' => null,
            'movimiento_anulado_id' => null,
        ];
    }

    public function debito(): static
    {
        return $this->state(fn (array $attributes) => ['tipo' => MovementTipo::Debito]);
    }

    public function credito(): static
    {
        return $this->state(fn (array $attributes) => [
            'tipo' => MovementTipo::Credito,
            'concepto' => 'Pago recibido',
        ]);
    }

    public function porMonto(string $monto): static
    {
        return $this->state(fn (array $attributes) => ['monto' => $monto]);
    }
}
