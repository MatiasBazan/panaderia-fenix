<?php

namespace App\Http\Requests\Concerns;

use Illuminate\Validation\Validator;

/**
 * Reglas del precio de un producto con variantes: el precio lo fija un solo
 * grupo (el tamaño, no el sabor), y el precio general sólo es obligatorio
 * cuando hace falta de respaldo — sin grupo con precio, o con alguna opción
 * de ese grupo sin precio.
 */
trait ValidaPreciosDeVariantes
{
    protected function validarPreciosDeVariantes(Validator $validator): void
    {
        if ($validator->errors()->hasAny(['variantes', 'precio_base'])) {
            return;
        }

        /** @var list<array{nombre: string, opciones: list<array{label: string, precio?: string}>}> $variantes */
        $variantes = (array) $this->input('variantes', []);

        $conPrecio = array_values(array_filter(
            $variantes,
            fn (array $grupo): bool => collect($grupo['opciones'])->contains(fn (array $opcion): bool => isset($opcion['precio'])),
        ));

        if (count($conPrecio) > 1) {
            $validator->errors()->add(
                'variantes',
                'El precio va en un solo grupo de variantes (por ejemplo, Tamaño). Dejá sin precio los demás.',
            );

            return;
        }

        $todasConPrecio = $conPrecio !== []
            && collect($conPrecio[0]['opciones'])->every(fn (array $opcion): bool => isset($opcion['precio']));

        if (! $todasConPrecio && blank($this->input('precio_base'))) {
            $validator->errors()->add(
                'precio_base',
                $conPrecio === []
                    ? 'Cargá el precio del producto.'
                    : 'Cargá el precio general o ponele precio a todas las opciones de «'.$conPrecio[0]['nombre'].'».',
            );
        }
    }
}
