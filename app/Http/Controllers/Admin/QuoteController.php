<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Quotes\GenerateQuote;
use App\Enums\QuoteEstado;
use App\Enums\QuoteRequestEstado;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateQuoteRequest;
use App\Models\Quote;
use App\Models\QuoteRequest;
use App\Support\Decimal;
use App\Support\PriceCalculator;
use App\Support\Settings;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

/**
 * Cotizaciones: se generan desde una solicitud, se editan mientras son
 * borrador y se envían una sola vez. Los totales siempre se recalculan acá.
 */
class QuoteController extends Controller
{
    public function __construct(private readonly PriceCalculator $prices) {}

    /** Genera el borrador a partir de la solicitud del público. */
    public function store(Request $request, QuoteRequest $quoteRequest, GenerateQuote $action): RedirectResponse
    {
        Gate::authorize('generateQuote', $quoteRequest);

        $quote = $action->handle($quoteRequest, $request->user());

        return redirect()
            ->route('admin.cotizaciones.show', $quoteRequest)
            ->with('exito', "Cotización {$quote->numero} generada como borrador.");
    }

    public function update(UpdateQuoteRequest $request, Quote $quote): RedirectResponse
    {
        /** @var list<array{product_id: int|null, descripcion: string, cantidad: string, precio_unitario: string}> $entrada */
        $entrada = $request->validated('items');

        $items = [];
        $subtotal = '0.00';

        foreach ($entrada as $item) {
            $lineaSubtotal = $this->prices->lineSubtotal(
                (string) $item['precio_unitario'],
                (string) $item['cantidad'],
            );

            $items[] = [
                'product_id' => $item['product_id'] ?? null,
                'descripcion' => $item['descripcion'],
                'cantidad' => (string) $item['cantidad'],
                'precio_unitario' => (string) $item['precio_unitario'],
                'subtotal' => $lineaSubtotal,
            ];

            $subtotal = Decimal::add($subtotal, $lineaSubtotal);
        }

        $descuento = $this->prices->round((string) $request->validated('descuento'));

        if (Decimal::compare($descuento, $subtotal) > 0) {
            return back()->withErrors([
                'descuento' => 'El descuento no puede superar el subtotal de la cotización.',
            ]);
        }

        DB::transaction(function () use ($quote, $items, $subtotal, $descuento, $request): void {
            // Los ítems se reemplazan enteros: es un borrador, no hay historial que cuidar.
            $quote->items()->delete();
            $quote->items()->createMany($items);

            $quote->update([
                'subtotal' => $subtotal,
                'descuento' => $descuento,
                'total' => Decimal::sub($subtotal, $descuento),
                'vence_el' => $request->validated('vence_el'),
                'observaciones' => $request->validated('observaciones'),
            ]);
        });

        return back()->with('exito', "Cotización {$quote->numero} actualizada.");
    }

    /** Marca la cotización como enviada y la cierra: a partir de acá ya no se edita. */
    public function send(Quote $quote): RedirectResponse
    {
        Gate::authorize('send', $quote);

        $quote->load(['items', 'quoteRequest']);

        DB::transaction(function () use ($quote): void {
            $quote->update([
                'estado' => QuoteEstado::Enviada,
                'enviada_el' => now(),
            ]);

            $quote->quoteRequest->update(['estado' => QuoteRequestEstado::Cotizada]);
        });

        return back()->with('exito', "Cotización {$quote->numero} marcada como enviada.");
    }

    public function pdf(Quote $quote, Settings $settings): HttpResponse
    {
        Gate::authorize('downloadPdf', $quote);

        $pdf = Pdf::loadView('pdf.quote', [
            'quote' => $quote->load(['items', 'quoteRequest']),
            'panaderia' => $settings->datosPanaderia(),
        ])->setPaper('a4');

        return $pdf->download("cotizacion-{$quote->numero}.pdf");
    }
}
