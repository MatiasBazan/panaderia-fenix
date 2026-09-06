<?php

namespace App\Actions\Quotes;

use App\Models\Quote;
use App\Models\QuoteRequest;

/**
 * Enlace wa.me hacia el cliente con la cotización ya escrita, para responderle
 * al número que dejó al pedir. Lo usan la bandeja y el detalle: contestar por
 * WhatsApp es la vía real de respuesta, no una acción escondida en una pantalla.
 *
 * Devuelve null si el teléfono no se puede llevar a un número válido.
 */
class BuildQuoteWhatsAppLink
{
    public function handle(QuoteRequest $solicitud, Quote $quote): ?string
    {
        $numero = $this->normalizarTelefono($solicitud->telefono);

        if ($numero === null) {
            return null;
        }

        $lineas = ["Hola {$solicitud->nombre}! Te paso la cotización de Panadería Fénix ({$quote->numero}):", ''];

        foreach ($quote->items as $item) {
            $cantidad = rtrim(rtrim((string) $item->cantidad, '0'), '.');
            $lineas[] = "• {$cantidad} × {$item->descripcion} — $".$this->plata($item->subtotal);
        }

        $lineas[] = '';

        if ((float) $quote->descuento > 0) {
            $lineas[] = 'Descuento: -$'.$this->plata($quote->descuento);
        }

        $lineas[] = 'Total: $'.$this->plata($quote->total);

        $sena = (int) config('fenix.sena_pedido');

        if ($sena > 0) {
            $lineas[] = 'Para reservarlo, seña de $'.number_format($sena, 0, ',', '.').'.';
        }

        $lineas[] = 'Válida hasta el '.$quote->vence_el->format('d/m/Y').'.';

        return 'https://wa.me/'.$numero.'?text='.rawurlencode(implode("\n", $lineas));
    }

    /** Monto en formato argentino: 12.345,67. */
    private function plata(string $monto): string
    {
        return number_format((float) $monto, 2, ',', '.');
    }

    /**
     * Lleva un teléfono argentino escrito a mano al formato que espera wa.me
     * (54 + 9 + área + número, sólo dígitos). Es best-effort: si el cliente dejó
     * algo muy raro puede fallar, por eso el front muestra el número al lado.
     */
    private function normalizarTelefono(string $telefono): ?string
    {
        $digitos = preg_replace('/\D+/', '', $telefono) ?? '';

        if ($digitos === '') {
            return null;
        }

        // Ya trae código de país.
        if (str_starts_with($digitos, '54')) {
            $resto = ltrim(substr($digitos, 2), '0');
        } else {
            $resto = ltrim($digitos, '0');
        }

        // El 15 delante del número local es interno de Argentina; wa.me usa el 9.
        if (str_starts_with($resto, '15')) {
            $resto = substr($resto, 2);
        }

        if ($resto === '') {
            return null;
        }

        // Asegurar el 9 de celular una sola vez.
        if (! str_starts_with($resto, '9')) {
            $resto = '9'.$resto;
        }

        return '54'.$resto;
    }
}
