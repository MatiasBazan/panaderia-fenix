<?php

namespace App\Http\Controllers\Public;

use App\Actions\QuoteRequests\CreateQuoteRequest;
use App\Actions\QuoteRequests\QuoteRequestData;
use App\Http\Controllers\Controller;
use App\Http\Requests\Public\StoreQuoteRequestRequest;
use App\Http\Resources\PublicProductResource;
use App\Models\Product;
use App\Support\Settings;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Solicitud de cotización del público. La lista de productos vive en el
 * navegador del visitante; el servidor sólo la valida al enviarla.
 */
class QuoteRequestController extends Controller
{
    /**
     * Pantalla de revisión. Recibe los ids que el visitante lleva armados y
     * devuelve los productos vigentes, para poder avisar si alguno se dio de baja.
     */
    public function create(Request $request, Settings $settings): Response
    {
        $ids = collect(explode(',', $request->string('items')->toString()))
            ->map(fn (string $id): int => (int) trim($id))
            ->filter()
            ->unique()
            ->values();

        $productos = $ids->isEmpty()
            ? collect()
            : Product::query()->activos()->with('category')->whereIn('id', $ids)->ordenados()->get();

        return Inertia::render('public/cotizacion', [
            'productos' => PublicProductResource::collection($productos),
            'zonas' => $settings->zonasEntrega(),
        ]);
    }

    public function store(StoreQuoteRequestRequest $request, CreateQuoteRequest $action): RedirectResponse
    {
        $solicitud = $action->handle(QuoteRequestData::fromRequest($request));

        return redirect()
            ->route('cotizacion.gracias')
            ->with('solicitud_id', $solicitud->id);
    }

    public function gracias(Request $request, Settings $settings): Response
    {
        return Inertia::render('public/cotizacion-gracias', [
            'enviada' => $request->session()->get('solicitud_id') !== null,
            'panaderia' => $settings->datosPanaderia(),
        ]);
    }
}
