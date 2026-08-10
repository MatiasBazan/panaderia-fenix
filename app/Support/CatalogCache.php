<?php

namespace App\Support;

use App\Models\Category;
use App\Models\Product;
use Closure;
use Illuminate\Support\Facades\Cache;

/**
 * Cacheo del catálogo público (la barra de categorías con sus conteos), que
 * cambia poco y hoy se recalcula en cada visita.
 *
 * La invalidación no usa tags (el store de base no los soporta): guarda un
 * "token de versión" y lo renueva cada vez que se toca un producto o categoría
 * ({@see Product::booted()} y {@see Category::booted()}).
 * Al cambiar el token, las claves viejas quedan huérfanas y expiran solas.
 */
class CatalogCache
{
    private const TOKEN_KEY = 'catalogo:token';

    /** TTL de respaldo por si algo no invalida: 1 hora. */
    private const TTL = 3600;

    /**
     * @template T
     *
     * @param  Closure(): T  $callback
     * @return T
     */
    public static function remember(string $clave, Closure $callback): mixed
    {
        $token = Cache::get(self::TOKEN_KEY, 'base');

        return Cache::remember("catalogo:{$token}:{$clave}", self::TTL, $callback);
    }

    /** Renueva el token → invalida todo lo cacheado del catálogo. */
    public static function invalidar(): void
    {
        Cache::forever(self::TOKEN_KEY, (string) now()->getTimestampMs());
    }
}
