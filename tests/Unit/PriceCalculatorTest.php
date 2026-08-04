<?php

use App\Support\PriceCalculator;

beforeEach(function () {
    $this->calc = new PriceCalculator;
});

it('deja el precio intacto cuando no hay descuento', function () {
    expect($this->calc->applyDiscount('3200.00', '0.00'))->toBe('3200.00');
});

it('aplica el descuento del comercio redondeando a dos decimales', function () {
    expect($this->calc->applyDiscount('3200.00', '12.00'))->toBe('2816.00')
        ->and($this->calc->applyDiscount('9800.00', '12.50'))->toBe('8575.00')
        ->and($this->calc->applyDiscount('1234.57', '15.00'))->toBe('1049.38');
});

it('redondea medio centavo hacia arriba', function () {
    expect($this->calc->round('10.005'))->toBe('10.01')
        ->and($this->calc->round('10.004'))->toBe('10.00');
});

it('calcula el subtotal de una línea', function () {
    expect($this->calc->lineSubtotal('2816.00', '3'))->toBe('8448.00')
        ->and($this->calc->lineSubtotal('3200.00', '2.5'))->toBe('8000.00');
});
