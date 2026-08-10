<?php

namespace App\Actions\QuoteRequests;

use App\Enums\QuoteRequestEstado;
use App\Mail\QuoteRequestReceived;
use App\Models\QuoteRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class CreateQuoteRequest
{
    /** Registra la solicitud con sus ítems y avisa a la panadería. */
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

        // Va por cola: el visitante no espera al servidor de mail.
        Mail::to(config('fenix.admin_email'))
            ->queue(new QuoteRequestReceived($quoteRequest->load('items.product')));

        return $quoteRequest;
    }
}
