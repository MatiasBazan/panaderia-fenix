<?php

namespace Database\Factories;

use App\Enums\ProductUnidad;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OrderItem>
 */
class OrderItemFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $cantidad = fake()->numberBetween(1, 20);
        $precio = fake()->randomFloat(2, 500, 20000);

        return [
            'order_id' => Order::factory(),
            'product_id' => Product::factory(),
            'nombre_producto' => function (array $attributes): string {
                $product = $this->productoDe($attributes);

                return $product === null ? fake()->word() : $product->nombre;
            },
            'unidad' => function (array $attributes): ProductUnidad {
                $product = $this->productoDe($attributes);

                return $product === null ? ProductUnidad::Unidad : $product->unidad;
            },
            'cantidad' => $cantidad,
            'precio_unitario' => $precio,
            'subtotal' => round($cantidad * $precio, 2),
        ];
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    protected function productoDe(array $attributes): ?Product
    {
        return Product::query()->whereKey($attributes['product_id'])->first();
    }

    /** Copia nombre, unidad y precio del producto, como hace el flujo real. */
    public function paraProducto(Product $product, float|int|string $cantidad, string $precioUnitario): static
    {
        return $this->state(fn (array $attributes) => [
            'product_id' => $product->id,
            'nombre_producto' => $product->nombre,
            'unidad' => $product->unidad,
            'cantidad' => $cantidad,
            'precio_unitario' => $precioUnitario,
            'subtotal' => round((float) $cantidad * (float) $precioUnitario, 2),
        ]);
    }
}
