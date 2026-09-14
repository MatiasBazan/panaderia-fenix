<?php

namespace App\Models;

use App\Enums\ProductUnidad;
use App\Support\CatalogCache;
use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $category_id
 * @property string $sku
 * @property string $nombre
 * @property string $slug
 * @property string|null $descripcion
 * @property list<array{nombre: string, opciones: list<array{label: string, precio?: string}>}>|null $variantes
 * @property ProductUnidad $unidad
 * @property string|null $precio_base
 * @property string|null $imagen
 * @property bool $activo
 * @property bool $destacado
 * @property int $orden
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Category $category
 */
#[Fillable([
    'category_id', 'sku', 'nombre', 'slug', 'descripcion', 'variantes', 'unidad',
    'precio_base', 'imagen', 'activo', 'destacado', 'orden',
])]
class Product extends Model
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory, SoftDeletes;

    protected static function booted(): void
    {
        // Cualquier alta/baja/edición de un producto vuelve obsoleto el catálogo cacheado.
        static::saved(fn () => CatalogCache::invalidar());
        static::deleted(fn () => CatalogCache::invalidar());
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'variantes' => 'array',
            'unidad' => ProductUnidad::class,
            'precio_base' => 'decimal:2',
            'activo' => 'boolean',
            'destacado' => 'boolean',
            'orden' => 'integer',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /**
     * Índice del grupo de variantes que fija el precio (el primero con alguna
     * opción con precio), o null si ninguno lo hace. La validación del admin
     * garantiza que haya a lo sumo uno.
     */
    public function grupoConPrecio(): ?int
    {
        foreach ($this->variantes ?? [] as $indice => $grupo) {
            foreach ($grupo['opciones'] as $opcion) {
                if (isset($opcion['precio'])) {
                    return $indice;
                }
            }
        }

        return null;
    }

    /**
     * Precio de lista de la variante elegida («Chocolate · Grande»). La opción
     * del grupo que fija precio reemplaza al precio general; si esa opción no
     * tiene precio, se cae al general.
     */
    public function precioPara(?string $variante): ?string
    {
        $indice = $this->grupoConPrecio();

        if ($indice === null) {
            return $this->precio_base;
        }

        $opciones = ($this->variantes ?? [])[$indice]['opciones'];
        $partes = $variante === null ? [] : explode(' · ', $variante);

        // La variante se compone en el orden de los grupos, así que primero se
        // busca en su posición; si no está (se reordenaron), por etiqueta.
        $elegida = collect($opciones)->firstWhere('label', $partes[$indice] ?? null)
            ?? collect($opciones)->first(fn (array $opcion): bool => in_array($opcion['label'], $partes, true))
            // Sin elección reconocible (un pedido de antes de las variantes): la
            // primera opción, que es la que el sitio deja elegida de entrada.
            ?? $opciones[0];

        return $elegida['precio'] ?? $this->precio_base;
    }

    /** El precio más bajo entre las opciones del grupo que fija precio, para el listado. */
    public function precioDesde(): ?string
    {
        $indice = $this->grupoConPrecio();

        if ($indice === null) {
            return null;
        }

        return collect(($this->variantes ?? [])[$indice]['opciones'])
            ->map(fn (array $opcion): ?string => $opcion['precio'] ?? $this->precio_base)
            ->filter(fn (?string $precio): bool => $precio !== null)
            ->sortBy(fn (string $precio): float => (float) $precio)
            ->first();
    }

    /** @return BelongsTo<Category, $this> */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /** @param Builder<$this> $query */
    public function scopeActivos(Builder $query): void
    {
        $query->where('activo', true);
    }

    /** @param Builder<$this> $query */
    public function scopeDestacados(Builder $query): void
    {
        $query->where('destacado', true);
    }

    /** @param Builder<$this> $query */
    public function scopeOrdenados(Builder $query): void
    {
        $query->orderBy('orden')->orderBy('nombre');
    }
}
