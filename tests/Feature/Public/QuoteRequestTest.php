<?php

use App\Actions\Quotes\GenerateQuote;
use App\Enums\QuoteEstado;
use App\Enums\QuoteRequestEstado;
use App\Enums\TipoPedido;
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
        'telefono' => '351-555-0000',
        'tipo' => 'minorista',
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
        ->and($solicitud->tipo)->toBe(TipoPedido::Minorista)
        ->and($solicitud->ip)->not->toBeNull()
        ->and($solicitud->items)->toHaveCount(2)
        ->and($solicitud->items->firstWhere('product_id', $pan->id)->nota)->toBe('Bien cocido');
});

it('guarda la variante elegida del producto', function () {
    $alfajor = Product::factory()->create();

    $this->post('/cotizacion', datosValidos([
        'items' => [
            ['product_id' => $alfajor->id, 'variante' => 'Chocolate · Grande', 'cantidad' => 2],
        ],
    ]))->assertRedirect('/cotizacion/gracias');

    expect(QuoteRequest::sole()->items->sole()->variante)->toBe('Chocolate · Grande');
});

it('mete la variante en el enlace de WhatsApp', function () {
    $alfajor = Product::factory()->create(['nombre' => 'Alfajores']);

    $this->post('/cotizacion', datosValidos([
        'items' => [
            ['product_id' => $alfajor->id, 'variante' => 'Maicena · Chico', 'cantidad' => 6],
        ],
    ]));

    $this->get('/cotizacion/gracias')->assertInertia(
        fn (Assert $page) => $page->where(
            'whatsappUrl',
            fn (string $url): bool => str_contains(
                rawurldecode($url),
                '6 × Alfajores — Maicena · Chico',
            ),
        ),
    );
});

it('cotiza sola la solicitud apenas entra', function () {
    $pan = Product::factory()->conPrecio('1000.00')->create();
    $facturas = Product::factory()->conPrecio('250.50')->create();

    $this->post('/cotizacion', datosValidos([
        'items' => [
            ['product_id' => $pan->id, 'cantidad' => 3],
            ['product_id' => $facturas->id, 'cantidad' => 2],
        ],
    ]));

    $cotizacion = QuoteRequest::sole()->quote;

    expect($cotizacion)->not->toBeNull()
        ->and($cotizacion->estado)->toBe(QuoteEstado::Borrador)
        ->and($cotizacion->items)->toHaveCount(2)
        ->and((float) $cotizacion->subtotal)->toBe(3501.00)
        ->and((float) $cotizacion->total)->toBe(3501.00)
        // Nadie la miró todavía: la cotiza el sistema, no un humano.
        ->and($cotizacion->created_by)->toBeNull();
});

it('deja la solicitud como nueva aunque ya esté cotizada', function () {
    $product = Product::factory()->create();

    $this->post('/cotizacion', datosValidos([
        'items' => [['product_id' => $product->id, 'cantidad' => 1]],
    ]));

    expect(QuoteRequest::sole()->estado)->toBe(QuoteRequestEstado::Nueva);
});

it('registra la solicitud aunque falle la cotización automática', function () {
    $product = Product::factory()->create();

    // El generador revienta: la solicitud del cliente no se puede perder por eso.
    $this->mock(GenerateQuote::class)
        ->shouldReceive('handle')
        ->andThrow(new RuntimeException('sin precio'));

    $this->post('/cotizacion', datosValidos([
        'items' => [['product_id' => $product->id, 'cantidad' => 1]],
    ]))->assertRedirect('/cotizacion/gracias');

    expect(QuoteRequest::sole()->quote)->toBeNull();
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

it('arma el enlace wa.me hacia Nati para un pedido minorista', function () {
    $product = Product::factory()->create(['nombre' => 'Pan casero']);

    $this->post('/cotizacion', datosValidos([
        'items' => [['product_id' => $product->id, 'cantidad' => 3, 'nota' => 'Bien cocido']],
    ]));

    $this->get('/cotizacion/gracias')->assertInertia(
        fn (Assert $page) => $page
            ->where('enviada', true)
            ->where('contacto', 'Nati')
            ->where('whatsappUrl', function (string $url): bool {
                $texto = rawurldecode($url);

                return str_contains($url, 'https://wa.me/'.config('fenix.contactos_pedidos.minorista.whatsapp'))
                    && str_contains($texto, 'Hola Nati!')
                    && str_contains($texto, '3 × Pan casero (Bien cocido)')
                    && str_contains($texto, 'Nombre: Lucía Ferreyra');
            }),
    );
});

it('avisa la seña del pedido en el mensaje de WhatsApp', function () {
    config()->set('fenix.sena_pedido', 3000);
    $product = Product::factory()->create();

    $this->post('/cotizacion', datosValidos([
        'items' => [['product_id' => $product->id, 'cantidad' => 1]],
    ]));

    $this->get('/cotizacion/gracias')->assertInertia(
        fn (Assert $page) => $page
            ->where('sena', 3000)
            ->where('whatsappUrl', fn (string $url): bool => str_contains(
                rawurldecode($url),
                'se seña con $3.000',
            )),
    );
});

it('deriva el pedido mayorista al WhatsApp de Juan', function () {
    $product = Product::factory()->create();

    $this->post('/cotizacion', datosValidos([
        'tipo' => 'mayorista',
        'items' => [['product_id' => $product->id, 'cantidad' => 1]],
    ]));

    $this->get('/cotizacion/gracias')->assertInertia(
        fn (Assert $page) => $page
            ->where('contacto', 'Juan')
            ->where('whatsappUrl', function (string $url): bool {
                return str_contains($url, 'https://wa.me/'.config('fenix.contactos_pedidos.mayorista.whatsapp'))
                    && str_contains(rawurldecode($url), 'Hola Juan!');
            }),
    );
});
