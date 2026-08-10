<?php

namespace App\Enums;

/**
 * Naturaleza del pedido que arma el visitante. Define a qué contacto de la
 * panadería se le abre el WhatsApp con la solicitud ya escrita.
 */
enum TipoPedido: string
{
    case Minorista = 'minorista';
    case Mayorista = 'mayorista';

    public function label(): string
    {
        return match ($this) {
            self::Minorista => 'Minorista / casual',
            self::Mayorista => 'Mayorista',
        };
    }
}
