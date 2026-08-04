<?php

namespace App\Support;

/**
 * Formato argentino de montos: punto para miles, coma para decimales.
 * Se usa en PDF y mails; en el front hay un helper equivalente.
 */
class Money
{
    public static function format(string|float|int|null $monto, bool $conSimbolo = true): string
    {
        $numero = number_format((float) ($monto ?? 0), 2, ',', '.');

        return $conSimbolo ? '$ '.$numero : $numero;
    }
}
