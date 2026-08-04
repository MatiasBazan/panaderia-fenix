<?php

namespace App\Enums;

enum ProductUnidad: string
{
    case Unidad = 'unidad';
    case Kg = 'kg';
    case Docena = 'docena';
    case Bandeja = 'bandeja';

    public function label(): string
    {
        return match ($this) {
            self::Unidad => 'por unidad',
            self::Kg => 'por kilo',
            self::Docena => 'por docena',
            self::Bandeja => 'por bandeja',
        };
    }

    /** Etiqueta corta para el badge en mono de la tarjeta de producto. */
    public function badge(): string
    {
        return match ($this) {
            self::Unidad => 'UNIDAD',
            self::Kg => 'KG',
            self::Docena => 'DOCENA',
            self::Bandeja => 'BANDEJA',
        };
    }

    /** Si admite cantidades fraccionadas (0,5 kg tiene sentido; media docena no se pide así). */
    public function admiteDecimales(): bool
    {
        return $this === self::Kg;
    }
}
