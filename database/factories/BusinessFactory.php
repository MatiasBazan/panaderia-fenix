<?php

namespace Database\Factories;

use App\Enums\BusinessEstado;
use App\Enums\CondicionIva;
use App\Models\Business;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Business>
 */
class BusinessFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $razonSocial = fake()->company();

        return [
            'razon_social' => $razonSocial,
            'nombre_fantasia' => fake()->boolean(70) ? fake()->company() : null,
            'cuit' => $this->cuit(),
            'condicion_iva' => fake()->randomElement(CondicionIva::cases()),
            'direccion' => fake()->streetAddress(),
            'localidad' => fake()->randomElement(['Córdoba', 'Villa Allende', 'Río Cuarto', 'Alta Gracia', 'Carlos Paz']),
            'telefono' => fake()->numerify('351-###-####'),
            'email_contacto' => fake()->unique()->companyEmail(),
            'descuento_porcentaje' => fake()->randomElement(['0.00', '5.00', '10.00', '12.50', '15.00']),
            'limite_credito' => fake()->boolean(60) ? fake()->randomElement(['150000.00', '300000.00', '500000.00']) : null,
            'saldo_actual' => '0.00',
            'estado' => BusinessEstado::Activo,
            'notas_internas' => null,
        ];
    }

    public function pendiente(): static
    {
        return $this->state(fn (array $attributes) => ['estado' => BusinessEstado::Pendiente]);
    }

    public function suspendido(): static
    {
        return $this->state(fn (array $attributes) => ['estado' => BusinessEstado::Suspendido]);
    }

    public function rechazado(): static
    {
        return $this->state(fn (array $attributes) => ['estado' => BusinessEstado::Rechazado]);
    }

    public function conDescuento(string $porcentaje): static
    {
        return $this->state(fn (array $attributes) => ['descuento_porcentaje' => $porcentaje]);
    }

    /** CUIT sintético con formato XX-XXXXXXXX-X (no valida dígito verificador). */
    protected function cuit(): string
    {
        return sprintf(
            '%s-%s-%s',
            fake()->randomElement(['20', '23', '27', '30', '33']),
            fake()->unique()->numerify('########'),
            fake()->numberBetween(0, 9),
        );
    }
}
