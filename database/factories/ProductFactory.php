<?php

namespace Database\Factories;

use App\Enums\ProductUnidad;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $nombre = Str::ucfirst(fake()->unique()->word().' '.fake()->word());

        return [
            'category_id' => Category::factory(),
            'sku' => strtoupper(fake()->unique()->bothify('???-###')),
            'nombre' => $nombre,
            'slug' => Str::slug($nombre),
            'descripcion' => fake()->sentence(),
            'unidad' => fake()->randomElement(ProductUnidad::cases()),
            'precio_base' => fake()->randomFloat(2, 500, 25000),
            'imagen' => null,
            'activo' => true,
            'destacado' => false,
            'orden' => fake()->numberBetween(0, 50),
        ];
    }

    public function inactivo(): static
    {
        return $this->state(fn (array $attributes) => ['activo' => false]);
    }

    public function destacado(): static
    {
        return $this->state(fn (array $attributes) => ['destacado' => true]);
    }

    public function conPrecio(string $precio): static
    {
        return $this->state(fn (array $attributes) => ['precio_base' => $precio]);
    }
}
