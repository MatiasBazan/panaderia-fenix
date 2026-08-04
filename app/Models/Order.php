<?php

namespace App\Models;

use App\Enums\FranjaEntrega;
use App\Enums\OrderEstado;
use Database\Factories\OrderFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $business_id
 * @property string $numero
 * @property Carbon $fecha_entrega
 * @property FranjaEntrega|null $franja_entrega
 * @property OrderEstado $estado
 * @property string $subtotal
 * @property string $descuento
 * @property string $total
 * @property string|null $observaciones
 * @property int|null $created_by
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Business $business
 * @property-read Collection<int, OrderItem> $items
 * @property-read User|null $creator
 * @property-read Collection<int, AccountMovement> $movements
 */
#[Fillable([
    'business_id', 'numero', 'fecha_entrega', 'franja_entrega', 'estado',
    'subtotal', 'descuento', 'total', 'observaciones', 'created_by',
])]
class Order extends Model
{
    /** @use HasFactory<OrderFactory> */
    use HasFactory, SoftDeletes;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'fecha_entrega' => 'date',
            'franja_entrega' => FranjaEntrega::class,
            'estado' => OrderEstado::class,
            'subtotal' => 'decimal:2',
            'descuento' => 'decimal:2',
            'total' => 'decimal:2',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'numero';
    }

    /** @return BelongsTo<Business, $this> */
    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    /** @return HasMany<OrderItem, $this> */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /** @return BelongsTo<User, $this> */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /** @return HasMany<AccountMovement, $this> */
    public function movements(): HasMany
    {
        return $this->hasMany(AccountMovement::class);
    }

    /** @param Builder<$this> $query */
    public function scopeDelComercio(Builder $query, Business|int $business): void
    {
        $query->where('business_id', $business instanceof Business ? $business->id : $business);
    }

    /** @param Builder<$this> $query */
    public function scopeActivos(Builder $query): void
    {
        $query->whereNotIn('estado', [OrderEstado::Cancelado]);
    }
}
