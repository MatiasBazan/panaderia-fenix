<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Encoders\WebpEncoder;
use Intervention\Image\ImageManager;

/**
 * Optimiza las fotos de producto al subirlas. En vez de guardar el archivo
 * crudo (que puede pesar varios MB), lo pasa a WebP y genera dos versiones:
 *
 *   - original acotado en ancho → detalle de producto
 *   - thumbnail recortado       → tarjetas y listados
 *
 * Las medidas salen de `config/fenix.php` (`imagen_producto`), que es el único
 * lugar donde se tocan. Así el catálogo sirve decenas de KB por foto en lugar
 * de megas, sin importar cómo venga la imagen que sube el admin.
 */
class ProductImageService
{
    /** Carpeta de las fotos dentro del disco `public`. */
    public const DIR = 'productos';

    private readonly ImageManager $manager;

    /** Ancho máximo del original que se muestra en el detalle. */
    private readonly int $anchoMax;

    private readonly int $anchoThumb;

    private readonly int $altoThumb;

    /** Calidad WebP. El default de 80 es donde no se nota la pérdida. */
    private readonly int $calidad;

    public function __construct()
    {
        // Driver GD: viene con PHP y trae soporte WebP en este entorno.
        $this->manager = new ImageManager(new Driver);

        $this->anchoMax = (int) config('fenix.imagen_producto.ancho_max');
        $this->anchoThumb = (int) config('fenix.imagen_producto.thumb_ancho');
        $this->altoThumb = (int) config('fenix.imagen_producto.thumb_alto');
        $this->calidad = (int) config('fenix.imagen_producto.calidad');
    }

    /**
     * Guarda original + thumbnail en el disco `public` y devuelve la ruta del
     * original (ej. `productos/abc123.webp`). El thumbnail se deriva de esa
     * ruta con {@see self::thumbDe()}.
     */
    public function guardar(UploadedFile $file): string
    {
        return $this->procesar((string) file_get_contents($file->getRealPath()));
    }

    /**
     * Re-genera original + thumbnail desde una foto que ya está en el disco
     * (por ejemplo, subida con el esquema viejo sin optimizar) y borra la
     * anterior. Devuelve la ruta nueva, o `null` si el archivo ya no existe.
     */
    public function regenerar(string $ruta): ?string
    {
        $disk = Storage::disk('public');

        if (! $disk->exists($ruta)) {
            return null;
        }

        $nueva = $this->procesar((string) $disk->get($ruta));
        $this->eliminar($ruta);

        return $nueva;
    }

    /**
     * Decodifica los bytes crudos, guarda las dos versiones WebP y devuelve la
     * ruta del original. Corazón compartido por {@see guardar()} y {@see regenerar()}.
     */
    private function procesar(string $binario): string
    {
        $ruta = self::DIR.'/'.Str::random(40).'.webp';
        $webp = new WebpEncoder(quality: $this->calidad);

        $grande = $this->manager->decode($binario)
            ->scaleDown(width: $this->anchoMax)
            ->encode($webp);

        $thumb = $this->manager->decode($binario)
            ->cover($this->anchoThumb, $this->altoThumb)
            ->encode($webp);

        $disk = Storage::disk('public');
        $disk->put($ruta, (string) $grande);
        $disk->put(self::thumbDe($ruta), (string) $thumb);

        return $ruta;
    }

    /** Borra el original y su thumbnail. No falla si ya no existen. */
    public function eliminar(?string $ruta): void
    {
        if ($ruta === null || $ruta === '') {
            return;
        }

        Storage::disk('public')->delete([$ruta, self::thumbDe($ruta)]);
    }

    /** `productos/abc.webp` → `productos/thumbs/abc.webp`. */
    public static function thumbDe(string $ruta): string
    {
        return dirname($ruta).'/thumbs/'.basename($ruta);
    }
}
