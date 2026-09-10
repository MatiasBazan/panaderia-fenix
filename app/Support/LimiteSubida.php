<?php

namespace App\Support;

/**
 * Cuánto pesa, de verdad, la foto más grande que se puede subir.
 *
 * La app pide un máximo en `config/fenix.php`, pero PHP tiene el suyo
 * (`upload_max_filesize` y `post_max_size`) y gana el más chico. Cuando la app
 * dice 10 MB y el servidor corta en 2, el archivo se descarta antes de que
 * Laravel lo vea y la validación termina culpando al formato: el admin lee
 * «tiene que ser una imagen» sobre una foto que estaba perfecta.
 *
 * Con esto el número que se valida, el que se muestra en la ayuda y el que
 * aparece en el mensaje de error son el mismo, y es el que rige.
 */
final class LimiteSubida
{
    /**
     * Máximo real en KB: el menor entre lo que pide la app y lo que deja PHP.
     */
    public static function kb(int $solicitadoKb): int
    {
        $topes = array_filter([
            $solicitadoKb,
            self::iniEnKb('upload_max_filesize'),
            self::iniEnKb('post_max_size'),
        ], static fn (int $kb): bool => $kb > 0);

        return $topes === [] ? $solicitadoKb : (int) min($topes);
    }

    /** El mismo máximo, escrito para una persona: `2`, `1,5`, `10`. */
    public static function texto(int $solicitadoKb): string
    {
        $mb = self::kb($solicitadoKb) / 1024;

        return rtrim(rtrim(number_format($mb, 1, ',', ''), '0'), ',');
    }

    /** ¿La app pide más de lo que el servidor deja pasar? */
    public static function servidorMandaSobre(int $solicitadoKb): bool
    {
        return self::kb($solicitadoKb) < $solicitadoKb;
    }

    /** Traduce el formato corto de php.ini (`2M`, `512K`, `1G`) a KB. */
    private static function iniEnKb(string $directiva): int
    {
        $valor = trim((string) ini_get($directiva));

        if ($valor === '') {
            return 0;
        }

        $numero = (int) $valor;
        $sufijo = strtolower(substr($valor, -1));

        return match ($sufijo) {
            'g' => $numero * 1024 * 1024,
            'm' => $numero * 1024,
            'k' => $numero,
            // Sin sufijo el valor viene en bytes.
            default => intdiv($numero, 1024),
        };
    }
}
