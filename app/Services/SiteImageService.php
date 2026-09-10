<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Encoders\WebpEncoder;
use Intervention\Image\ImageManager;

/**
 * Optimiza las fotos del sitio público (hoy, las de la landing).
 *
 * Hermano de {@see ProductImageService}, con una diferencia que justifica que
 * sean dos clases: una foto de producto se ve en dos tamaños —ficha y tarjeta—
 * y por eso necesita thumbnail; las de la landing se muestran en un solo lugar
 * y a un solo tamaño, así que generar una segunda versión sería un archivo que
 * nadie pide nunca.
 *
 * El ancho sale de `config/fenix.php` (`fotos_landing.<slot>.ancho`): cada
 * hueco tiene el suyo, porque la del encabezado se ve a todo lo ancho y la de
 * la miga entra en 176 px.
 */
class SiteImageService
{
    /** Carpeta de las fotos del sitio dentro del disco `public`. */
    public const DIR = 'sitio';

    private readonly ImageManager $manager;

    private readonly int $calidad;

    public function __construct()
    {
        // Driver GD: viene con PHP y trae soporte WebP en este entorno.
        $this->manager = new ImageManager(new Driver);

        $this->calidad = (int) config('fenix.imagen_sitio.calidad');
    }

    /**
     * Guarda la foto de un hueco como WebP acotado a lo ancho y devuelve su
     * ruta (ej. `sitio/abc123.webp`). No recorta: la proporción que se le pide
     * al admin es una recomendación, y recortarle la foto por su cuenta es
     * peor que mostrarla un poco más alta de lo previsto.
     */
    public function guardar(UploadedFile $file, string $slot): string
    {
        $ruta = self::DIR.'/'.Str::random(40).'.webp';

        $webp = $this->manager
            ->decode((string) file_get_contents($file->getRealPath()))
            ->scaleDown(width: self::anchoDe($slot))
            ->encode(new WebpEncoder(quality: $this->calidad));

        Storage::disk('public')->put($ruta, (string) $webp);

        return $ruta;
    }

    /** Borra la foto. No falla si ya no existe. */
    public function eliminar(?string $ruta): void
    {
        if ($ruta === null || $ruta === '') {
            return;
        }

        Storage::disk('public')->delete($ruta);
    }

    /** Ancho configurado para un hueco, con un default sano si no está. */
    public static function anchoDe(string $slot): int
    {
        return (int) config("fenix.fotos_landing.{$slot}.ancho", 1600);
    }

    /**
     * Los huecos definidos, tal como los declara la config.
     *
     * @return array<string, array{label: string, ayuda: string, proporcion: string, ancho: int}>
     */
    public static function huecos(): array
    {
        /** @var array<string, array{label: string, ayuda: string, proporcion: string, ancho: int}> $huecos */
        $huecos = config('fenix.fotos_landing', []);

        return $huecos;
    }

    public static function esHuecoValido(string $slot): bool
    {
        return array_key_exists($slot, self::huecos());
    }
}
