<?php

namespace App\Actions\QuoteRequests;

use App\Actions\Quotes\GenerateQuote;
use App\Enums\QuoteRequestEstado;
use App\Mail\QuoteRequestReceived;
use App\Models\QuoteRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class CreateQuoteRequest
{
    public function __construct(private readonly GenerateQuote $generar) {}

    /** Registra la solicitud con sus ítems, la cotiza y avisa a la panadería. */
    public function handle(QuoteRequestData $datos): QuoteRequest
    {
        $quoteRequest = DB::transaction(function () use ($datos): QuoteRequest {
            $quoteRequest = QuoteRequest::create([
                'nombre' => $datos->nombre,
                'telefono' => $datos->telefono,
                'tipo' => $datos->tipo,
                'localidad' => $datos->localidad,
                'mensaje' => $datos->mensaje,
                'fecha_evento' => $datos->fechaEvento,
                'estado' => QuoteRequestEstado::Nueva,
                'ip' => $datos->ip,
            ]);

            $quoteRequest->items()->createMany($datos->items);

            return $quoteRequest;
        });

        $this->cotizar($quoteRequest);

        // Va por cola: el visitante no espera al servidor de mail.
        Mail::to(config('fenix.admin_email'))
            ->queue(new QuoteRequestReceived($quoteRequest->load('items.product')));

        return $quoteRequest;
    }

    /**
     * Borrador de cotización apenas entra la solicitud: los productos ya tienen
     * precio, así que hacer que el admin apriete «generar» para ver un número que
     * el sistema puede calcular solo es trabajo de más. Queda en borrador y la
     * solicitud sigue "nueva" — el admin revisa, ajusta y recién ahí la envía.
     *
     * Si algo falla, la solicitud igual queda registrada: perder el pedido de un
     * cliente porque no se pudo calcular un total sería mucho peor. El detalle
     * ofrece generar la cotización a mano.
     */
    private function cotizar(QuoteRequest $quoteRequest): void
    {
        try {
            $this->generar->handle($quoteRequest, marcarEnProceso: false);
        } catch (Throwable $e) {
            Log::error('No se pudo cotizar la solicitud automáticamente.', [
                'quote_request_id' => $quoteRequest->id,
                'exception' => $e,
            ]);
        }
    }
}
