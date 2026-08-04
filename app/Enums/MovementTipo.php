<?php

namespace App\Enums;

enum MovementTipo: string
{
    case Debito = 'debito';
    case Credito = 'credito';

    public function label(): string
    {
        return match ($this) {
            self::Debito => 'Débito',
            self::Credito => 'Crédito',
        };
    }

    /**
     * Signo con el que el movimiento impacta en el saldo.
     * El débito aumenta la deuda del comercio; el crédito la baja.
     */
    public function signo(): int
    {
        return match ($this) {
            self::Debito => 1,
            self::Credito => -1,
        };
    }

    public function opuesto(): self
    {
        return match ($this) {
            self::Debito => self::Credito,
            self::Credito => self::Debito,
        };
    }
}
