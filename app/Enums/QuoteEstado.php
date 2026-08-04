<?php

namespace App\Enums;

enum QuoteEstado: string
{
    case Borrador = 'borrador';
    case Enviada = 'enviada';
    case Aceptada = 'aceptada';
    case Rechazada = 'rechazada';
    case Vencida = 'vencida';

    public function label(): string
    {
        return match ($this) {
            self::Borrador => 'Borrador',
            self::Enviada => 'Enviada',
            self::Aceptada => 'Aceptada',
            self::Rechazada => 'Rechazada',
            self::Vencida => 'Vencida',
        };
    }

    /** Un borrador todavía se puede editar; una cotización enviada ya no. */
    public function esEditable(): bool
    {
        return $this === self::Borrador;
    }
}
