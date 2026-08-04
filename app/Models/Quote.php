<?php

namespace App\Models;

use App\Enums\QuoteEstado;
use Database\Factories\QuoteFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $quote_request_id
 * @property string $numero
 * @property string $subtotal
 * @property string $descuento
 * @property string $total
 * @property Carbon $vence_el
 * @property string|null $observaciones
 * @property QuoteEstado $estado
 * @property Carbon|null $enviada_el
 * @property int|null $created_by
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read QuoteRequest $quoteRequest
 * @property-read Collection<int, QuoteItem> $items
 * @property-read User|null $creator
 */
#[Fillable([
    'quote_request_id', 'numero', 'subtotal', 'descuento', 'total',
    'vence_el', 'observaciones', 'estado', 'enviada_el', 'created_by',
])]
class Quote extends Model
{
    /** @use HasFactory<QuoteFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'descuento' => 'decimal:2',
            'total' => 'decimal:2',
            'vence_el' => 'date',
            'enviada_el' => 'datetime',
            'estado' => QuoteEstado::class,
        ];
    }

    /** @return BelongsTo<QuoteRequest, $this> */
    public function quoteRequest(): BelongsTo
    {
        return $this->belongsTo(QuoteRequest::class);
    }

    /** @return HasMany<QuoteItem, $this> */
    public function items(): HasMany
    {
        return $this->hasMany(QuoteItem::class);
    }

    /** @return BelongsTo<User, $this> */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function estaVencida(): bool
    {
        return $this->vence_el->isPast();
    }

    /** @param Builder<$this> $query */
    public function scopeEnviadas(Builder $query): void
    {
        $query->where('estado', QuoteEstado::Enviada);
    }
}
