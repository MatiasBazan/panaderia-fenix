<?php

namespace App\Actions\Quotes;

use App\Enums\QuoteEstado;
use App\Enums\QuoteRequestEstado;
use App\Models\Quote;
use App\Models\QuoteRequest;
use App\Models\User;
use App\Support\Decimal;
use App\Support\DocumentNumber;
use App\Support\PriceCalculator;
use Illuminate\Support\Facades\DB;

/**
 * Convierte una solicitud del público en un borrador de cotización.
 *
 * Los precios salen de `PriceCalculator` sin descuento: la solicitud viene de
 * un visitante anónimo, todavía no hay comercio al que aplicarle una lista.
 * El admin ajusta ítems y descuento después, editando el borrador.
 */
class GenerateQuote
{
    /** Vigencia por defecto del borrador, en días. */
    public const VIGENCIA_DIAS = 15;

    public function __construct(
        private readonly DocumentNumber $numbers,
        private readonly PriceCalculator $prices,
    ) {}

    /**
     * @param  bool  $marcarEnProceso  Falso cuando la genera el sistema al entrar
     *                                 la solicitud: nadie la miró todavía, así que
     *                                 tiene que seguir figurando como nueva.
     */
    public function handle(QuoteRequest $quoteRequest, ?User $creator = null, bool $marcarEnProceso = true): Quote
    {
        return DB::transaction(function () use ($quoteRequest, $creator, $marcarEnProceso): Quote {
            // `withTrashed`: un producto dado de baja sigue teniendo nombre y precio,
            // y la solicitud original lo pidió igual.
            $quoteRequest->load(['items.product' => fn ($query) => $query->withTrashed()]);

            $items = [];
            $subtotal = '0.00';

            foreach ($quoteRequest->items as $item) {
                $product = $item->product;
                $precioUnitario = $this->prices->unitPrice($product);
                $lineaSubtotal = $this->prices->lineSubtotal($precioUnitario, (string) $item->cantidad);

                $descripcion = $product->nombre;

                if ($item->variante !== null && $item->variante !== '') {
                    $descripcion .= " — {$item->variante}";
                }

                if ($item->nota !== null && $item->nota !== '') {
                    $descripcion .= " ({$item->nota})";
                }

                $items[] = [
                    'product_id' => $product->id,
                    'descripcion' => $descripcion,
                    'cantidad' => (string) $item->cantidad,
                    'precio_unitario' => $precioUnitario,
                    'subtotal' => $lineaSubtotal,
                ];

                $subtotal = Decimal::add($subtotal, $lineaSubtotal);
            }

            // Dentro de la transacción: `DocumentNumber` bloquea la última fila.
            $quote = Quote::create([
                'quote_request_id' => $quoteRequest->id,
                'numero' => $this->numbers->next(Quote::class, (string) config('fenix.prefijo_cotizacion')),
                'subtotal' => $subtotal,
                'descuento' => '0.00',
                'total' => $subtotal,
                'vence_el' => now()->addDays(self::VIGENCIA_DIAS),
                'estado' => QuoteEstado::Borrador,
                'created_by' => $creator?->id,
            ]);

            $quote->items()->createMany($items);

            // La solicitud pasa a "en proceso": recién queda "cotizada" cuando se envía.
            if ($marcarEnProceso && $quoteRequest->estado === QuoteRequestEstado::Nueva) {
                $quoteRequest->update(['estado' => QuoteRequestEstado::EnProceso]);
            }

            return $quote;
        });
    }
}
