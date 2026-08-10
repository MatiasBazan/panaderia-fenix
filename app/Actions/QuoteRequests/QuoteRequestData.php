<?php

namespace App\Actions\QuoteRequests;

use App\Http\Requests\Public\StoreQuoteRequestRequest;

/**
 * Datos ya validados de una solicitud de cotización, con forma conocida.
 * Evita pasear arrays sueltos entre el controlador y la acción.
 */
final class QuoteRequestData
{
    /**
     * @param  list<array{product_id: int, cantidad: string, nota: string|null}>  $items
     */
    public function __construct(
        public readonly string $nombre,
        public readonly string $telefono,
        public readonly string $tipo,
        public readonly ?string $localidad,
        public readonly ?string $mensaje,
        public readonly ?string $fechaEvento,
        public readonly array $items,
        public readonly ?string $ip,
    ) {}

    public static function fromRequest(StoreQuoteRequestRequest $request): self
    {
        $items = [];

        foreach ((array) $request->input('items', []) as $item) {
            if (! is_array($item)) {
                continue;
            }

            $nota = isset($item['nota']) ? trim((string) $item['nota']) : '';

            $items[] = [
                'product_id' => (int) ($item['product_id'] ?? 0),
                'cantidad' => (string) ($item['cantidad'] ?? '0'),
                'nota' => $nota === '' ? null : $nota,
            ];
        }

        return new self(
            nombre: (string) $request->input('nombre'),
            telefono: (string) $request->input('telefono'),
            tipo: (string) $request->input('tipo'),
            localidad: self::opcional($request->input('localidad')),
            mensaje: self::opcional($request->input('mensaje')),
            fechaEvento: self::opcional($request->input('fecha_evento')),
            items: $items,
            ip: $request->ip(),
        );
    }

    private static function opcional(mixed $valor): ?string
    {
        $texto = trim((string) ($valor ?? ''));

        return $texto === '' ? null : $texto;
    }
}
