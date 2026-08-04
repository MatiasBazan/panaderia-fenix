<?php

namespace App\Models;

use App\Enums\ProductUnidad;
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
 * @property ProductUnidad $unidad
 * @property string $precio_base
 * @property string|null $imagen
 * @property bool $activo
 * @property bool $destacado
 * @property int $orden
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Category $category
 */
#[Fillable([
    'category_id', 'sku', 'nombre', 'slug', 'descripcion', 'unidad',
    'precio_base', 'imagen', 'activo', 'destacado', 'orden',
])]
class Product extends Model
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory, SoftDeletes;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
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
