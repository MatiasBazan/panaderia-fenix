<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\QuoteRequest;
use App\Models\QuoteRequestItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<QuoteRequestItem>
 */
class QuoteRequestItemFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'quote_request_id' => QuoteRequest::factory(),
            'product_id' => Product::factory(),
            'cantidad' => fake()->numberBetween(1, 20),
            'nota' => null,
        ];
    }
}
