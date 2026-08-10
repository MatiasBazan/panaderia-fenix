<?php

namespace App\Models;

use App\Support\CatalogCache;
use Database\Factories\CategoryFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $nombre
 * @property string $slug
 * @property int $orden
 * @property bool $activo
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Collection<int, Product> $products
 */
#[Fillable(['nombre', 'slug', 'orden', 'activo'])]
class Category extends Model
{
    /** @use HasFactory<CategoryFactory> */
    use HasFactory;

    protected static function booted(): void
    {
        // El nombre/orden/estado de una categoría se refleja en la barra cacheada del catálogo.
        static::saved(fn () => CatalogCache::invalidar());
        static::deleted(fn () => CatalogCache::invalidar());
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'activo' => 'boolean',
            'orden' => 'integer',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /** @return HasMany<Product, $this> */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    /** @param Builder<$this> $query */
    public function scopeActivas(Builder $query): void
    {
        $query->where('activo', true);
    }

    /** @param Builder<$this> $query */
    public function scopeOrdenadas(Builder $query): void
    {
        $query->orderBy('orden')->orderBy('nombre');
    }
}
