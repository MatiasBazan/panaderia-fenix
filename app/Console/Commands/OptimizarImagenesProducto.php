<?php

namespace App\Console\Commands;

use App\Models\Product;
use App\Services\ProductImageService;
use Illuminate\Console\Command;

/**
 * Re-procesa las fotos de producto ya guardadas con el pipeline actual
 * (WebP + thumbnail). Sirve para migrar imágenes viejas subidas antes de
 * tener optimización, o para re-generar todo si cambian los tamaños.
 */
class OptimizarImagenesProducto extends Command
{
    protected $signature = 'productos:optimizar-imagenes';

    protected $description = 'Convierte a WebP y genera thumbnails de las fotos de producto ya cargadas';

    public function handle(ProductImageService $imagenes): int
    {
        $productos = Product::query()->whereNotNull('imagen')->get();

        if ($productos->isEmpty()) {
            $this->info('No hay productos con foto para optimizar.');

            return self::SUCCESS;
        }

        $optimizados = 0;

        foreach ($productos as $producto) {
            $nueva = $imagenes->regenerar($producto->imagen);

            if ($nueva === null) {
                $this->warn("• {$producto->nombre}: el archivo no existe, se saltea.");

                continue;
            }

            $producto->forceFill(['imagen' => $nueva])->save();
            $this->line("• {$producto->nombre}: {$nueva}");
            $optimizados++;
        }

        $this->info("Listo: {$optimizados} imagen(es) optimizada(s).");

        return self::SUCCESS;
    }
}
