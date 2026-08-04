<?php

namespace App\Models;

use Database\Factories\QuoteRequestItemFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $quote_request_id
 * @property int $product_id
 * @property string $cantidad
 * @property string|null $nota
 * @property-read QuoteRequest $quoteRequest
 * @property-read Product $product
 */
#[Fillable(['quote_request_id', 'product_id', 'cantidad', 'nota'])]
class QuoteRequestItem extends Model
{
    /** @use HasFactory<QuoteRequestItemFactory> */
    use HasFactory;

    public $timestamps = false;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'cantidad' => 'decimal:2',
        ];
    }

    /** @return BelongsTo<QuoteRequest, $this> */
    public function quoteRequest(): BelongsTo
    {
        return $this->belongsTo(QuoteRequest::class);
    }

    /** @return BelongsTo<Product, $this> */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
