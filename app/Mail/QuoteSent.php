<?php

namespace App\Mail;

use App\Models\Quote;
use App\Support\Settings;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * La cotización que sale para el cliente, con el PDF adjunto.
 */
class QuoteSent extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public Quote $quote) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Tu cotización {$this->quote->numero}",
            replyTo: [(string) config('fenix.admin_email')],
        );
    }

    public function content(): Content
    {
        $this->quote->loadMissing(['items', 'quoteRequest']);

        return new Content(
            markdown: 'mail.quote-sent',
            with: [
                'quote' => $this->quote,
                'solicitud' => $this->quote->quoteRequest,
            ],
        );
    }

    /**
     * @return list<Attachment>
     */
    public function attachments(): array
    {
        return [
            Attachment::fromData(
                fn (): string => Pdf::loadView('pdf.quote', [
                    'quote' => $this->quote->loadMissing(['items', 'quoteRequest']),
                    'panaderia' => app(Settings::class)->datosPanaderia(),
                ])->setPaper('a4')->output(),
                "cotizacion-{$this->quote->numero}.pdf",
            )->withMime('application/pdf'),
        ];
    }
}
