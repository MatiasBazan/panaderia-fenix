<?php

namespace App\Models;

use App\Enums\ProductUnidad;
use Database\Factories\OrderItemFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Los campos `nombre_producto`, `unidad` y `precio_unitario` son snapshots del
 * momento del pedido: nunca se leen del producto actual.
 *
 * @property int $id
 * @property int $order_id
 * @property int $product_id
 * @property string $nombre_producto
 * @property ProductUnidad $unidad
 * @property string $cantidad
 * @property string $precio_unitario
 * @property string $subtotal
 * @property-read Order $order
 * @property-read Product $product
 */
#[Fillable([
    'order_id', 'product_id', 'nombre_producto', 'unidad',
    'cantidad', 'precio_unitario', 'subtotal',
])]
class OrderItem extends Model
{
    /** @use HasFactory<OrderItemFactory> */
    use HasFactory;

    public $timestamps = false;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'unidad' => ProductUnidad::class,
            'cantidad' => 'decimal:2',
            'precio_unitario' => 'decimal:2',
            'subtotal' => 'decimal:2',
        ];
    }

    /** @return BelongsTo<Order, $this> */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /** @return BelongsTo<Product, $this> */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
