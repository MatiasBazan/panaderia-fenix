<?php

namespace App\Enums;

enum BusinessEstado: string
{
    case Pendiente = 'pendiente';
    case Activo = 'activo';
    case Suspendido = 'suspendido';
    case Rechazado = 'rechazado';

    public function label(): string
    {
        return match ($this) {
            self::Pendiente => 'Pendiente de aprobación',
            self::Activo => 'Activo',
            self::Suspendido => 'Suspendido',
            self::Rechazado => 'Rechazado',
        };
    }

    /** Sólo un comercio activo puede operar en el portal. */
    public function puedeOperar(): bool
    {
        return $this === self::Activo;
    }
}
