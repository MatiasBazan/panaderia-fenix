<?php

namespace App\Http\Controllers\Admin;

use App\Enums\QuoteRequestEstado;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateQuoteRequestEstadoRequest;
use App\Models\Quote;
use App\Models\QuoteRequest;
use App\Models\QuoteRequestItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Bandeja de solicitudes de cotización. El detalle muestra la solicitud junto
 * a su cotización, si ya se generó.
 */
class QuoteRequestController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', QuoteRequest::class);

        $estado = $request->string('estado')->toString();
        $busqueda = $request->string('q')->trim()->toString();

        $solicitudes = QuoteRequest::query()
            ->withCount('items')
            ->with('quote:id,quote_request_id,numero,estado,total')
            ->when($estado === 'pendientes', fn ($query) => $query->pendientes())
            ->when(
                $estado !== '' && $estado !== 'pendientes',
                fn ($query) => $query->where('estado', $estado),
            )
            ->when($busqueda !== '', fn ($query) => $query->where(
                fn ($q) => $q->where('nombre', 'like', "%{$busqueda}%")
                    ->orWhere('email', 'like', "%{$busqueda}%")
                    ->orWhere('telefono', 'like', "%{$busqueda}%"),
            ))
            ->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(fn (QuoteRequest $solicitud): array => [
                'id' => $solicitud->id,
                'nombre' => $solicitud->nombre,
                'email' => $solicitud->email,
                'telefono' => $solicitud->telefono,
                'localidad' => $solicitud->localidad,
                'fecha_evento' => $solicitud->fecha_evento?->toDateString(),
                'estado' => $solicitud->estado->value,
                'estado_label' => $solicitud->estado->label(),
                'items_count' => $solicitud->items_count,
                'creada_el' => $solicitud->created_at?->toIso8601String(),
                'cotizacion' => $solicitud->quote === null ? null : [
                    'id' => $solicitud->quote->id,
                    'numero' => $solicitud->quote->numero,
                    'estado' => $solicitud->quote->estado->value,
                    'total' => (string) $solicitud->quote->total,
                ],
            ]);

        return Inertia::render('admin/cotizaciones/index', [
            'solicitudes' => $solicitudes,
            'estados' => $this->opcionesEstados(),
            'filtros' => [
                'estado' => $estado === '' ? null : $estado,
                'q' => $busqueda === '' ? null : $busqueda,
            ],
        ]);
    }

    public function show(QuoteRequest $quoteRequest): Response
    {
        Gate::authorize('view', $quoteRequest);

        // `withTrashed` en el producto: si se dio de baja, la solicitud igual
        // tiene que poder leerse tal como entró.
        $quoteRequest->load([
            'items.product' => fn ($query) => $query->withTrashed(),
            'quote.items',
            'quote.creator:id,name',
        ]);

        return Inertia::render('admin/cotizaciones/show', [
            'solicitud' => [
                'id' => $quoteRequest->id,
                'nombre' => $quoteRequest->nombre,
                'email' => $quoteRequest->email,
                'telefono' => $quoteRequest->telefono,
                'localidad' => $quoteRequest->localidad,
                'mensaje' => $quoteRequest->mensaje,
                'fecha_evento' => $quoteRequest->fecha_evento?->toDateString(),
                'estado' => $quoteRequest->estado->value,
                'estado_label' => $quoteRequest->estado->label(),
                'ip' => $quoteRequest->ip,
                'creada_el' => $quoteRequest->created_at?->toIso8601String(),
                'items' => $quoteRequest->items->map(fn (QuoteRequestItem $item): array => [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'nombre' => $item->product->nombre,
                    'unidad_label' => $item->product->unidad->label(),
                    'precio_base' => (string) $item->product->precio_base,
                    'dado_de_baja' => $item->product->trashed(),
                    'cantidad' => (string) $item->cantidad,
                    'nota' => $item->nota,
                ]),
            ],
            'cotizacion' => $quoteRequest->quote === null
                ? null
                : $this->cotizacionToArray($quoteRequest->quote),
            'estados' => $this->opcionesEstados(),
            'puede_generar' => Gate::allows('generateQuote', $quoteRequest),
        ]);
    }

    public function updateEstado(UpdateQuoteRequestEstadoRequest $request, QuoteRequest $quoteRequest): RedirectResponse
    {
        $quoteRequest->update(['estado' => $request->validated('estado')]);

        return back()->with('exito', 'Estado de la solicitud actualizado.');
    }

    /**
     * @return array<string, mixed>
     */
    private function cotizacionToArray(Quote $quote): array
    {
        return [
            'id' => $quote->id,
            'numero' => $quote->numero,
            'subtotal' => (string) $quote->subtotal,
            'descuento' => (string) $quote->descuento,
            'total' => (string) $quote->total,
            'vence_el' => $quote->vence_el->toDateString(),
            'vencida' => $quote->estaVencida(),
            'observaciones' => $quote->observaciones,
            'estado' => $quote->estado->value,
            'estado_label' => $quote->estado->label(),
            'editable' => $quote->estado->esEditable(),
            'enviada_el' => $quote->enviada_el?->toIso8601String(),
            'creada_por' => $quote->creator?->name,
            'items' => $quote->items->map(fn ($item): array => [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'descripcion' => $item->descripcion,
                'cantidad' => (string) $item->cantidad,
                'precio_unitario' => (string) $item->precio_unitario,
                'subtotal' => (string) $item->subtotal,
            ]),
        ];
    }

    /**
     * @return list<array{value: string, label: string}>
     */
    private function opcionesEstados(): array
    {
        return array_map(
            fn (QuoteRequestEstado $estado): array => [
                'value' => $estado->value,
                'label' => $estado->label(),
            ],
            QuoteRequestEstado::cases(),
        );
    }
}
