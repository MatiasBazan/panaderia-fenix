<?php

namespace App\Models;

use App\Enums\QuoteRequestEstado;
use Database\Factories\QuoteRequestFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $nombre
 * @property string $email
 * @property string $telefono
 * @property string|null $localidad
 * @property string|null $mensaje
 * @property Carbon|null $fecha_evento
 * @property QuoteRequestEstado $estado
 * @property string|null $ip
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Collection<int, QuoteRequestItem> $items
 * @property-read Quote|null $quote
 */
#[Fillable(['nombre', 'email', 'telefono', 'localidad', 'mensaje', 'fecha_evento', 'estado', 'ip'])]
class QuoteRequest extends Model
{
    /** @use HasFactory<QuoteRequestFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'fecha_evento' => 'date',
            'estado' => QuoteRequestEstado::class,
        ];
    }

    /** @return HasMany<QuoteRequestItem, $this> */
    public function items(): HasMany
    {
        return $this->hasMany(QuoteRequestItem::class);
    }

    /** @return HasOne<Quote, $this> */
    public function quote(): HasOne
    {
        return $this->hasOne(Quote::class);
    }

    /** @param Builder<$this> $query */
    public function scopePendientes(Builder $query): void
    {
        $query->whereIn('estado', [QuoteRequestEstado::Nueva, QuoteRequestEstado::EnProceso]);
    }
}
