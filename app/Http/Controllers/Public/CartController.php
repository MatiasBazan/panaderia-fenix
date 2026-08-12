<?php

namespace App\Http\Controllers\Public;

use App\Actions\Cart\ResolveCartProducts;
use App\Http\Controllers\Controller;
use App\Http\Resources\PublicProductResource;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Paso 1 del pedido: revisar la lista. El pedido en sí vive en el navegador;
 * el servidor sólo dice qué productos siguen vigentes.
 */
class CartController extends Controller
{
    public function __invoke(Request $request, ResolveCartProducts $resolver): Response
    {
        ['consultados' => $consultados, 'productos' => $productos] = $resolver
            ->handle($request->string('items')->toString());

        return Inertia::render('public/carrito', [
            'productos' => PublicProductResource::collection($productos),
            'consultados' => $consultados,
        ]);
    }
}
