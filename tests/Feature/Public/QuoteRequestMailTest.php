<?php

use App\Enums\TipoPedido;
use App\Mail\QuoteRequestReceived;
use App\Models\Product;
use App\Models\Quote;
use App\Models\QuoteRequest;
use App\Models\QuoteRequestItem;

function solicitudConPedido(array $atributos = []): QuoteRequest
{
    $solicitud = QuoteRequest::factory()->create([
        'nombre' => 'Marta Perez',
        'telefono' => '3472 527326',
        'tipo' => TipoPedido::Mayorista,
        'mensaje' => 'Es para un cumple',
        ...$atributos,
    ]);

    QuoteRequestItem::factory()->create([
        'quote_request_id' => $solicitud->id,
        'product_id' => Product::factory()->create(['nombre' => 'Pastaflora'])->id,
        'cantidad' => 3,
        'variante' => 'Membrillo',
    ]);

    return $solicitud;
}

it('arma el aviso con el logo, los datos del pedido y los accesos', function () {
    $solicitud = solicitudConPedido();

    (new QuoteRequestReceived($solicitud))
        ->assertSeeInHtml('/img/logo-384.png', false)
        ->assertSeeInHtml('Marta Perez')
        ->assertSeeInHtml('Pastaflora')
        ->assertSeeInHtml('Membrillo')
        ->assertSeeInHtml('Es para un cumple')
        ->assertSeeInHtml("/admin/cotizaciones/{$solicitud->id}", false)
        ->assertSeeInHtml('https://wa.me/5493472527326', false);
});

it('muestra el total del borrador de cotización cuando ya está calculado', function () {
    $solicitud = solicitudConPedido();
    Quote::factory()->create([
        'quote_request_id' => $solicitud->id,
        'numero' => 'COT-2026-0042',
        'total' => '45600.00',
    ]);

    (new QuoteRequestReceived($solicitud))
        ->assertSeeInHtml('COT-2026-0042')
        ->assertSeeInHtml('45.600,00')
        ->assertSeeInText('45.600,00');
});

it('manda una versión de texto plano sin HTML', function () {
    $solicitud = solicitudConPedido();

    (new QuoteRequestReceived($solicitud))
        ->assertSeeInText('Pastaflora')
        ->assertSeeInText("/admin/cotizaciones/{$solicitud->id}")
        ->assertDontSeeInText('<table');
});
