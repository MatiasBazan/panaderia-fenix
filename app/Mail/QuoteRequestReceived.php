<?php

namespace App\Mail;

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
        return new Content(
            markdown: 'mail.quote-request-received',
            with: [
                'solicitud' => $this->quoteRequest,
                'url' => url("/admin/cotizaciones/{$this->quoteRequest->id}"),
            ],
        );
    }
}
