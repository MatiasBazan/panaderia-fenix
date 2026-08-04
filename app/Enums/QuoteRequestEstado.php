<?php

namespace App\Enums;

enum QuoteRequestEstado: string
{
    case Nueva = 'nueva';
    case EnProceso = 'en_proceso';
    case Cotizada = 'cotizada';
    case Aceptada = 'aceptada';
    case Rechazada = 'rechazada';
    case Vencida = 'vencida';

    public function label(): string
    {
        return match ($this) {
            self::Nueva => 'Nueva',
            self::EnProceso => 'En proceso',
            self::Cotizada => 'Cotizada',
            self::Aceptada => 'Aceptada',
            self::Rechazada => 'Rechazada',
            self::Vencida => 'Vencida',
        };
    }

    /** Solicitudes que todavía esperan respuesta de la panadería. */
    public function esPendiente(): bool
    {
        return in_array($this, [self::Nueva, self::EnProceso], true);
    }
}
