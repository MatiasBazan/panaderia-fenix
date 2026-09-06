<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Quotes\BuildQuoteWhatsAppLink;
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
    public function __construct(private readonly BuildQuoteWhatsAppLink $whatsapp) {}

    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', QuoteRequest::class);

        $estado = $request->string('estado')->toString();
        $busqueda = $request->string('q')->trim()->toString();

        $solicitudes = QuoteRequest::query()
            ->withCount('items')
            // Los ítems de la cotización van también: el mensaje de WhatsApp que
            // se ofrece en cada fila los lista uno por uno.
            ->with(['quote:id,quote_request_id,numero,estado,subtotal,descuento,total,vence_el', 'quote.items'])
            ->when($estado === 'pendientes', fn ($query) => $query->pendientes())
            ->when(
                $estado !== '' && $estado !== 'pendientes',
                fn ($query) => $query->where('estado', $estado),
            )
            ->when($busqueda !== '', fn ($query) => $query->where(
                fn ($q) => $q->where('nombre', 'like', "%{$busqueda}%")
                    ->orWhere('telefono', 'like', "%{$busqueda}%"),
            ))
            ->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(fn (QuoteRequest $solicitud): array => [
                'id' => $solicitud->id,
                'nombre' => $solicitud->nombre,
                'telefono' => $solicitud->telefono,
                'tipo' => $solicitud->tipo->value,
                'tipo_label' => $solicitud->tipo->label(),
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
                    // Si todavía es borrador, responder por WhatsApp la da por enviada.
                    'editable' => $solicitud->quote->estado->esEditable(),
                ],
                // Responder por WhatsApp desde la propia bandeja, sin abrir el
                // detalle: es lo que se hace con casi todas las solicitudes.
                'whatsapp_cliente' => $solicitud->quote === null
                    ? null
                    : $this->whatsapp->handle($solicitud, $solicitud->quote),
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
                'telefono' => $quoteRequest->telefono,
                'tipo_label' => $quoteRequest->tipo->label(),
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
                    'variante' => $item->variante,
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
            // Enlace wa.me hacia el cliente con la cotización ya escrita, para
            // responderle al número que dejó al pedir. Null si no hay cotización
            // o el teléfono no se pudo normalizar.
            'whatsapp_cliente' => $quoteRequest->quote === null
                ? null
                : $this->whatsapp->handle($quoteRequest, $quoteRequest->quote),
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
