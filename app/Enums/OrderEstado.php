<?php

namespace App\Enums;

enum OrderEstado: string
{
    case Pendiente = 'pendiente';
    case Confirmado = 'confirmado';
    case EnPreparacion = 'en_preparacion';
    case Listo = 'listo';
    case Entregado = 'entregado';
    case Cancelado = 'cancelado';

    public function label(): string
    {
        return match ($this) {
            self::Pendiente => 'Pendiente',
            self::Confirmado => 'Confirmado',
            self::EnPreparacion => 'En preparación',
            self::Listo => 'Listo',
            self::Entregado => 'Entregado',
            self::Cancelado => 'Cancelado',
        };
    }

    /**
     * Estados de la línea de tiempo del pedido, en orden.
     * `cancelado` queda afuera: es una salida, no un paso.
     *
     * @return list<self>
     */
    public static function timeline(): array
    {
        return [
            self::Pendiente,
            self::Confirmado,
            self::EnPreparacion,
            self::Listo,
            self::Entregado,
        ];
    }

    /** Posición en la línea de tiempo, o null si el pedido está cancelado. */
    public function paso(): ?int
    {
        $index = array_search($this, self::timeline(), true);

        return $index === false ? null : $index;
    }

    public function esFinal(): bool
    {
        return in_array($this, [self::Entregado, self::Cancelado], true);
    }

    /** El débito en cuenta corriente se genera únicamente al entregar. */
    public function generaDebito(): bool
    {
        return $this === self::Entregado;
    }
}
