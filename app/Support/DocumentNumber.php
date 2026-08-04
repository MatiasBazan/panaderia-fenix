<?php

namespace App\Support;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/**
 * Numeración de documentos: `COT-2026-0001`, `PED-2026-0001`.
 *
 * La secuencia arranca de nuevo cada año y sale del último número emitido,
 * leído con bloqueo de fila. Llamar siempre dentro de una transacción: sin
 * ella el `lockForUpdate` no protege de nada.
 */
class DocumentNumber
{
    /**
     * @param  class-string<Model>  $model
     */
    public function next(string $model, string $prefijo, ?int $anio = null): string
    {
        $anio ??= (int) now()->format('Y');
        $raiz = "{$prefijo}-{$anio}-";

        /** @var Builder<Model> $query */
        $query = $model::query();

        /** @var string|null $ultimo */
        $ultimo = $query
            ->where('numero', 'like', $raiz.'%')
            ->orderByDesc('numero')
            ->lockForUpdate()
            ->value('numero');

        $secuencia = $ultimo === null
            ? 1
            : ((int) substr($ultimo, strlen($raiz))) + 1;

        return $raiz.str_pad((string) $secuencia, 4, '0', STR_PAD_LEFT);
    }
}
