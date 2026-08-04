<?php

use App\Enums\QuoteRequestEstado;
use App\Mail\QuoteRequestReceived;
use App\Models\Product;
use App\Models\QuoteRequest;
use Illuminate\Support\Facades\Mail;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    Mail::fake();
});

function datosValidos(array $overrides = []): array
{
    return array_merge([
        'nombre' => 'Lucía Ferreyra',
        'email' => 'lucia@example.com',
        'telefono' => '351-555-0000',
        'localidad' => 'Córdoba',
        'mensaje' => 'Es para el cumpleaños de mi hija.',
        'fecha_evento' => now()->addWeek()->toDateString(),
    ], $overrides);
}

it('registra la solicitud con sus ítems', function () {
    $pan = Product::factory()->create();
    $facturas = Product::factory()->create();

    $this->post('/cotizacion', datosValidos([
        'items' => [
            ['product_id' => $pan->id, 'cantidad' => 3, 'nota' => 'Bien cocido'],
            ['product_id' => $facturas->id, 'cantidad' => 2],
        ],
    ]))->assertRedirect('/cotizacion/gracias');

    $solicitud = QuoteRequest::sole();

    expect($solicitud->nombre)->toBe('Lucía Ferreyra')
        ->and($solicitud->estado)->toBe(QuoteRequestEstado::Nueva)
        ->and($solicitud->ip)->not->toBeNull()
        ->and($solicitud->items)->toHaveCount(2)
        ->and($solicitud->items->firstWhere('product_id', $pan->id)->nota)->toBe('Bien cocido');
});

it('avisa a la panadería por mail', function () {
    $product = Product::factory()->create();

    $this->post('/cotizacion', datosValidos([
        'items' => [['product_id' => $product->id, 'cantidad' => 1]],
    ]));

    Mail::assertQueued(
        QuoteRequestReceived::class,
        fn (QuoteRequestReceived $mail): bool => $mail->hasTo(config('fenix.admin_email')),
    );
});

it('rechaza una solicitud sin productos', function () {
    $this->post('/cotizacion', datosValidos(['items' => []]))
        ->assertSessionHasErrors('items');

    expect(QuoteRequest::count())->toBe(0);
});

it('rechaza productos inactivos', function () {
    $product = Product::factory()->inactivo()->create();

    $this->post('/cotizacion', datosValidos([
        'items' => [['product_id' => $product->id, 'cantidad' => 1]],
    ]))->assertSessionHasErrors('items.0.product_id');

    expect(QuoteRequest::count())->toBe(0);
});

it('rechaza una fecha de evento pasada', function () {
    $product = Product::factory()->create();

    $this->post('/cotizacion', datosValidos([
        'fecha_evento' => now()->subDay()->toDateString(),
        'items' => [['product_id' => $product->id, 'cantidad' => 1]],
    ]))->assertSessionHasErrors('fecha_evento');
});

it('descarta el envío cuando el honeypot viene completo', function () {
    $product = Product::factory()->create();

    $this->post('/cotizacion', datosValidos([
        'sitio_web' => 'http://spam.example',
        'items' => [['product_id' => $product->id, 'cantidad' => 1]],
    ]))->assertSessionHasErrors('sitio_web');

    expect(QuoteRequest::count())->toBe(0);
    Mail::assertNothingQueued();
});

it('limita la cantidad de envíos por minuto', function () {
    $product = Product::factory()->create();
    $payload = datosValidos(['items' => [['product_id' => $product->id, 'cantidad' => 1]]]);

    foreach (range(1, 5) as $i) {
        $this->post('/cotizacion', $payload)->assertRedirect('/cotizacion/gracias');
    }

    $this->post('/cotizacion', $payload)->assertTooManyRequests();
});

it('no dice que se envió nada si se entra directo a la pantalla de gracias', function () {
    $this->get('/cotizacion/gracias')->assertInertia(
        fn (Assert $page) => $page
            ->component('public/cotizacion-gracias')
            ->where('enviada', false),
    );
});

it('marca la pantalla de gracias como enviada después de un envío', function () {
    $product = Product::factory()->create();

    $this->post('/cotizacion', datosValidos([
        'items' => [['product_id' => $product->id, 'cantidad' => 1]],
    ]));

    $this->get('/cotizacion/gracias')->assertInertia(
        fn (Assert $page) => $page->where('enviada', true),
    );
});
