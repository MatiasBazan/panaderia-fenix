<?php

namespace App\Actions\Cart;

use App\Models\Product;
use Illuminate\Support\Collection;

/**
 * Traduce los ids que el visitante trae en la URL a los productos que todavía
 * están a la venta. Los dos pasos del pedido lo usan igual: el carrito para
 * avisar qué se dio de baja, el formulario para no enviar un producto muerto.
 *
 * Nunca confía en el navegador: los ids se filtran y el listado sale de la base.
 */
class ResolveCartProducts
{
    /**
     * Ids pedidos y productos encontrados. Los dos hacen falta: sin saber qué se
     * consultó, «no vino ninguno» es indistinguible de «no pregunté por ninguno»,
     * y el front termina avisando que dieron de baja un pedido entero que está
     * perfecto.
     *
     * @return array{consultados: list<int>, productos: Collection<int, Product>}
     */
    public function handle(string $ids): array
    {
        $consultados = collect(explode(',', $ids))
            ->map(fn (string $id): int => (int) trim($id))
            ->filter(fn (int $id): bool => $id > 0)
            ->unique()
            // Un pedido tiene 60 líneas como máximo (StoreQuoteRequestRequest).
            ->take(60)
            ->values();

        if ($consultados->isEmpty()) {
            return ['consultados' => [], 'productos' => collect()];
        }

        return [
            'consultados' => array_values($consultados->all()),
            'productos' => Product::query()
                ->activos()
                ->with('category')
                ->whereIn('id', $consultados)
                ->ordenados()
                ->get(),
        ];
    }
}
