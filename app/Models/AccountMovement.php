<?php

namespace App\Models;

use App\Enums\MovementTipo;
use App\Support\Decimal;
use Database\Factories\AccountMovementFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;

/**
 * Libro de cuenta corriente: sólo se agrega, nunca se edita ni se borra.
 * Para corregir se registra un movimiento inverso apuntando al original.
 *
 * @property int $id
 * @property int $business_id
 * @property MovementTipo $tipo
 * @property string $concepto
 * @property int|null $order_id
 * @property string $monto
 * @property Carbon $fecha
 * @property int|null $created_by
 * @property int|null $movimiento_anulado_id
 * @property Carbon|null $created_at
 * @property-read Business $business
 * @property-read Order|null $order
 * @property-read User|null $creator
 * @property-read AccountMovement|null $movimientoAnulado
 * @property-read AccountMovement|null $anulacion
 */
#[Fillable([
    'business_id', 'tipo', 'concepto', 'order_id', 'monto',
    'fecha', 'created_by', 'movimiento_anulado_id',
])]
class AccountMovement extends Model
{
    /** @use HasFactory<AccountMovementFactory> */
    use HasFactory;

    public const UPDATED_AT = null;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tipo' => MovementTipo::class,
            'monto' => 'decimal:2',
            'fecha' => 'date',
        ];
    }

    /** @return BelongsTo<Business, $this> */
    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    /** @return BelongsTo<Order, $this> */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /** @return BelongsTo<User, $this> */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /** Movimiento original que este movimiento anula. */
    /** @return BelongsTo<AccountMovement, $this> */
    public function movimientoAnulado(): BelongsTo
    {
        return $this->belongsTo(AccountMovement::class, 'movimiento_anulado_id');
    }

    /** Movimiento inverso que anula a éste, si existe. */
    /** @return HasOne<AccountMovement, $this> */
    public function anulacion(): HasOne
    {
        return $this->hasOne(AccountMovement::class, 'movimiento_anulado_id');
    }

    /** Monto con signo, listo para sumar al saldo. */
    public function montoConSigno(): string
    {
        return $this->tipo === MovementTipo::Debito
            ? Decimal::of($this->monto)
            : Decimal::negate($this->monto);
    }

    /** @param Builder<$this> $query */
    public function scopeDelComercio(Builder $query, Business|int $business): void
    {
        $query->where('business_id', $business instanceof Business ? $business->id : $business);
    }
}
