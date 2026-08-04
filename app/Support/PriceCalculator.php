<?php

namespace App\Support;

use App\Models\Business;
use App\Models\Product;

/**
 * Única fuente de verdad para el precio que paga un comercio.
 * Ningún otro lugar del sistema debe repetir esta fórmula.
 */
class PriceCalculator
{
    /**
     * Precio unitario con el descuento del comercio aplicado, redondeado a 2 decimales.
     * Devuelve string decimal para no arrastrar errores de punto flotante.
     */
    public function unitPrice(Product $product, ?Business $business = null): string
    {
        return $this->applyDiscount(
            (string) $product->precio_base,
            $business === null ? '0.00' : (string) $business->descuento_porcentaje,
        );
    }

    /** Aplica un porcentaje de descuento a un precio base. */
    public function applyDiscount(string $precioBase, string $descuentoPorcentaje): string
    {
        $factor = Decimal::sub('100', $descuentoPorcentaje, 4);

        return Decimal::round(Decimal::div(Decimal::mul($precioBase, $factor, 6), '100', 6));
    }

    /** Subtotal de una línea: precio unitario × cantidad. */
    public function lineSubtotal(string $precioUnitario, string $cantidad): string
    {
        return Decimal::round(Decimal::mul($precioUnitario, $cantidad, 6));
    }

    /** Redondeo comercial a 2 decimales (half-up). */
    public function round(string $monto): string
    {
        return Decimal::round($monto);
    }
}
