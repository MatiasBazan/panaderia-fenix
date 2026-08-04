<?php

namespace App\Enums;

enum CondicionIva: string
{
    case ResponsableInscripto = 'responsable_inscripto';
    case Monotributo = 'monotributo';
    case Exento = 'exento';
    case ConsumidorFinal = 'consumidor_final';

    public function label(): string
    {
        return match ($this) {
            self::ResponsableInscripto => 'Responsable inscripto',
            self::Monotributo => 'Monotributo',
            self::Exento => 'Exento',
            self::ConsumidorFinal => 'Consumidor final',
        };
    }
}
