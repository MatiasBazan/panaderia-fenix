<?php

namespace App\Support;

/**
 * Normaliza las variantes que manda el formulario del admin. Viajan como string
 * JSON (el form es multipart por la foto), así que hay que decodificarlas antes
 * de validarlas, y de paso se limpian: se recortan los textos y el precio vacío
 * pasa a ausente en vez de quedar como `""`, que no es un número.
 */
class VarianteInput
{
    /**
     * @return list<array{nombre: string, opciones: list<array{label: string, precio?: string}>}>
     */
    public static function normalizar(mixed $variantes): array
    {
        if (is_string($variantes)) {
            $variantes = json_decode($variantes, true);
        }

        if (! is_array($variantes)) {
            return [];
        }

        $normalizadas = [];

        foreach ($variantes as $grupo) {
            if (! is_array($grupo)) {
                continue;
            }

            $opciones = [];

            foreach (is_array($grupo['opciones'] ?? null) ? $grupo['opciones'] : [] as $opcion) {
                if (! is_array($opcion)) {
                    continue;
                }

                $normalizada = ['label' => trim((string) ($opcion['label'] ?? ''))];

                // El precio de referencia es opcional: si no vino, la opción no
                // lo lleva (los sabores de la pastaflora, por ejemplo).
                $precio = $opcion['precio'] ?? null;

                if (is_scalar($precio) && $precio !== '' && $precio !== false) {
                    $normalizada['precio'] = (string) $precio;
                }

                $opciones[] = $normalizada;
            }

            $normalizadas[] = [
                'nombre' => trim((string) ($grupo['nombre'] ?? '')),
                'opciones' => $opciones,
            ];
        }

        return $normalizadas;
    }
}
