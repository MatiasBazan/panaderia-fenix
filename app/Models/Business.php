<?php

namespace App\Models;

use App\Enums\BusinessEstado;
use App\Enums\CondicionIva;
use Database\Factories\BusinessFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $razon_social
 * @property string|null $nombre_fantasia
 * @property string $cuit
 * @property CondicionIva $condicion_iva
 * @property string $direccion
 * @property string $localidad
 * @property string $telefono
 * @property string $email_contacto
 * @property string $descuento_porcentaje
 * @property string|null $limite_credito
 * @property string $saldo_actual
 * @property BusinessEstado $estado
 * @property string|null $notas_internas
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Collection<int, User> $users
 * @property-read Collection<int, Order> $orders
 * @property-read Collection<int, AccountMovement> $movements
 */
#[Fillable([
    'razon_social', 'nombre_fantasia', 'cuit', 'condicion_iva', 'direccion', 'localidad',
    'telefono', 'email_contacto', 'descuento_porcentaje', 'limite_credito', 'estado', 'notas_internas',
])]
class Business extends Model
{
    /** @use HasFactory<BusinessFactory> */
    use HasFactory, SoftDeletes;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'condicion_iva' => CondicionIva::class,
            'estado' => BusinessEstado::class,
            'descuento_porcentaje' => 'decimal:2',
            'limite_credito' => 'decimal:2',
            'saldo_actual' => 'decimal:2',
        ];
    }

    /** @return HasMany<User, $this> */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /** @return HasMany<Order, $this> */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /** @return HasMany<AccountMovement, $this> */
    public function movements(): HasMany
    {
        return $this->hasMany(AccountMovement::class);
    }

    public function nombreVisible(): string
    {
        return $this->nombre_fantasia ?: $this->razon_social;
    }

    public function puedeOperar(): bool
    {
        return $this->estado->puedeOperar();
    }

    /** @param Builder<$this> $query */
    public function scopeActivos(Builder $query): void
    {
        $query->where('estado', BusinessEstado::Activo);
    }

    /** @param Builder<$this> $query */
    public function scopePendientes(Builder $query): void
    {
        $query->where('estado', BusinessEstado::Pendiente);
    }
}
