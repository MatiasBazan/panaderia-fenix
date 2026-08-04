<?php

namespace App\Support;

use InvalidArgumentException;

/**
 * Aritmética decimal exacta sobre bcmath. Los montos viajan como string en
 * todo el sistema: nunca se convierten a float.
 */
final class Decimal
{
    public const SCALE = 2;

    /**
     * Valida y normaliza un valor a string numérico.
     *
     * @return numeric-string
     */
    public static function of(string|int|float $valor): string
    {
        $texto = is_string($valor) ? trim($valor) : (string) $valor;

        if (! is_numeric($texto)) {
            throw new InvalidArgumentException("El valor [{$texto}] no es un número válido.");
        }

        return $texto;
    }

    public static function add(string|int|float $a, string|int|float $b, int $scale = self::SCALE): string
    {
        return bcadd(self::of($a), self::of($b), $scale);
    }

    public static function sub(string|int|float $a, string|int|float $b, int $scale = self::SCALE): string
    {
        return bcsub(self::of($a), self::of($b), $scale);
    }

    public static function mul(string|int|float $a, string|int|float $b, int $scale = self::SCALE): string
    {
        return bcmul(self::of($a), self::of($b), $scale);
    }

    public static function div(string|int|float $a, string|int|float $b, int $scale = self::SCALE): string
    {
        return bcdiv(self::of($a), self::of($b), $scale);
    }

    public static function compare(string|int|float $a, string|int|float $b, int $scale = self::SCALE): int
    {
        return bccomp(self::of($a), self::of($b), $scale);
    }

    public static function isZero(string|int|float $valor, int $scale = self::SCALE): bool
    {
        return self::compare($valor, '0', $scale) === 0;
    }

    /** Redondeo comercial a `$scale` decimales (half-up), sin pasar por float. */
    public static function round(string|int|float $valor, int $scale = self::SCALE): string
    {
        $monto = self::of($valor);
        $negativo = str_starts_with($monto, '-');
        $absoluto = ltrim($monto, '-');

        $mitad = bcdiv('5', bcpow('10', (string) ($scale + 1), $scale + 1), $scale + 1);
        $redondeado = bcadd(bcadd($absoluto, $mitad, $scale + 1), '0', $scale);

        return $negativo && bccomp($redondeado, '0', $scale) !== 0
            ? '-'.$redondeado
            : $redondeado;
    }

    /** Invierte el signo de un monto, sin producir `-0.00`. */
    public static function negate(string|int|float $valor, int $scale = self::SCALE): string
    {
        return self::mul($valor, '-1', $scale) === '-0.00'
            ? bcadd('0', '0', $scale)
            : self::mul($valor, '-1', $scale);
    }
}
