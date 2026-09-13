<?php

namespace App\Mail;

use App\Actions\Quotes\BuildQuoteWhatsAppLink;
use App\Models\QuoteRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Aviso interno: entró una solicitud de cotización nueva.
 */
class QuoteRequestReceived extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public QuoteRequest $quoteRequest) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Nueva solicitud de cotización de {$this->quoteRequest->nombre}",
        );
    }

    public function content(): Content
    {
        $solicitud = $this->quoteRequest->loadMissing(['items.product', 'quote']);

        return new Content(
            markdown: 'mail.quote-request-received',
            // Texto propio: el markdown lleva HTML y en texto plano se vería crudo.
            text: 'mail.quote-request-received-text',
            with: [
                'solicitud' => $solicitud,
                // El borrador se genera antes de mandar el aviso; puede faltar si falló.
                'cotizacion' => $solicitud->quote,
                'url' => url("/admin/cotizaciones/{$solicitud->id}"),
                'whatsapp' => app(BuildQuoteWhatsAppLink::class)->chat($solicitud->telefono),
            ],
        );
    }
}
