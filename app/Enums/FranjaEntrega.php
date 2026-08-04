<?php

namespace App\Enums;

enum FranjaEntrega: string
{
    case Manana = 'manana';
    case Tarde = 'tarde';

    public function label(): string
    {
        return match ($this) {
            self::Manana => 'Mañana',
            self::Tarde => 'Tarde',
        };
    }
}
