<?php

use App\Enums\QuoteEstado;
use App\Enums\QuoteRequestEstado;
use App\Models\Product;
use App\Models\Quote;
use App\Models\QuoteItem;
use App\Models\QuoteRequest;
use App\Models\QuoteRequestItem;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();

    // Las páginas React de administración son la fase siguiente: acá se
    // verifica el contrato de props, no que el componente exista.
    config(['inertia.testing.ensure_pages_exist' => false]);
});

/** Solicitud con dos ítems de precio conocido: 2 × 1000 + 3 × 500 = 3500. */
function solicitudConItems(): QuoteRequest
{
    $solicitud = QuoteRequest::factory()->create(['estado' => QuoteRequestEstado::Nueva]);

    QuoteRequestItem::factory()->for($solicitud)->create([
        'product_id' => Product::factory()->conPrecio('1000.00'),
        'cantidad' => '2',
    ]);

    QuoteRequestItem::factory()->for($solicitud)->create([
        'product_id' => Product::factory()->conPrecio('500.00'),
        'cantidad' => '3',
    ]);

    return $solicitud;
}

it('genera el borrador de cotización con los totales calculados', function () {
    $solicitud = solicitudConItems();

    $this->actingAs($this->admin)
        ->post("/admin/cotizaciones/{$solicitud->id}/generar")
        ->assertRedirect("/admin/cotizaciones/{$solicitud->id}");

    $quote = Quote::query()->firstOrFail();

    expect($quote->numero)->toStartWith('COT-'.now()->format('Y').'-')
        ->and((string) $quote->subtotal)->toBe('3500.00')
        ->and((string) $quote->total)->toBe('3500.00')
        ->and($quote->estado)->toBe(QuoteEstado::Borrador)
        ->and($quote->items)->toHaveCount(2)
        ->and($quote->created_by)->toBe($this->admin->id)
        ->and($solicitud->fresh()->estado)->toBe(QuoteRequestEstado::EnProceso);
});

it('cotiza cada línea con el precio de la variante que fija el precio', function () {
    $alfajores = Product::factory()->create([
        'precio_base' => null,
        'variantes' => [
            ['nombre' => 'Relleno', 'opciones' => [['label' => 'Chocolate'], ['label' => 'Maicena']]],
            ['nombre' => 'Tamaño', 'opciones' => [
                ['label' => 'Grande', 'precio' => '15800.00'],
                ['label' => 'Chico', 'precio' => '9800.00'],
            ]],
        ],
    ]);

    $solicitud = QuoteRequest::factory()->create(['estado' => QuoteRequestEstado::Nueva]);

    QuoteRequestItem::factory()->for($solicitud)->create([
        'product_id' => $alfajores->id,
        'variante' => 'Chocolate · Grande',
        'cantidad' => '2',
    ]);

    QuoteRequestItem::factory()->for($solicitud)->create([
        'product_id' => $alfajores->id,
        'variante' => 'Maicena · Chico',
        'cantidad' => '1',
    ]);

    $this->actingAs($this->admin)->post("/admin/cotizaciones/{$solicitud->id}/generar");

    $quote = Quote::query()->with('items')->firstOrFail();

    expect($quote->items->pluck('precio_unitario')->map(fn ($p) => (string) $p)->all())
        ->toBe(['15800.00', '9800.00'])
        ->and((string) $quote->subtotal)->toBe('41400.00');
});

it('no genera una segunda cotización para la misma solicitud', function () {
    $solicitud = solicitudConItems();

    $this->actingAs($this->admin)->post("/admin/cotizaciones/{$solicitud->id}/generar");
    $this->actingAs($this->admin)
        ->post("/admin/cotizaciones/{$solicitud->id}/generar")
        ->assertForbidden();

    expect(Quote::query()->count())->toBe(1);
});

it('recalcula los totales al editar el borrador', function () {
    $solicitud = solicitudConItems();
    $this->actingAs($this->admin)->post("/admin/cotizaciones/{$solicitud->id}/generar");
    $quote = Quote::query()->firstOrFail();

    $this->actingAs($this->admin)
        ->put("/admin/cotizaciones/{$quote->id}", [
            'vence_el' => now()->addDays(10)->toDateString(),
            'observaciones' => 'Entrega en dos tandas.',
            'descuento' => '200.00',
            'items' => [
                ['product_id' => null, 'descripcion' => 'Combo evento', 'cantidad' => '4', 'precio_unitario' => '750.50'],
            ],
        ])
        ->assertRedirect();

    $quote->refresh();

    expect((string) $quote->subtotal)->toBe('3002.00')
        ->and((string) $quote->descuento)->toBe('200.00')
        ->and((string) $quote->total)->toBe('2802.00')
        ->and($quote->items)->toHaveCount(1);
});

it('rechaza un descuento mayor al subtotal', function () {
    $solicitud = solicitudConItems();
    $this->actingAs($this->admin)->post("/admin/cotizaciones/{$solicitud->id}/generar");
    $quote = Quote::query()->firstOrFail();

    $this->actingAs($this->admin)
        ->put("/admin/cotizaciones/{$quote->id}", [
            'vence_el' => now()->addDays(10)->toDateString(),
            'descuento' => '9999.00',
            'items' => [
                ['product_id' => null, 'descripcion' => 'Combo', 'cantidad' => '1', 'precio_unitario' => '100.00'],
            ],
        ])
        ->assertSessionHasErrors('descuento');

    expect((string) $quote->fresh()->total)->toBe('3500.00');
});

it('envía la cotización y la cierra para edición', function () {
    $solicitud = solicitudConItems();
    $this->actingAs($this->admin)->post("/admin/cotizaciones/{$solicitud->id}/generar");
    $quote = Quote::query()->firstOrFail();

    $this->actingAs($this->admin)
        ->post("/admin/cotizaciones/{$quote->id}/enviar")
        ->assertSessionHas('exito');

    $quote->refresh();

    expect($quote->estado)->toBe(QuoteEstado::Enviada)
        ->and($quote->enviada_el)->not->toBeNull()
        ->and($solicitud->fresh()->estado)->toBe(QuoteRequestEstado::Cotizada);

    // Ya enviada: el borrador no se toca más.
    $this->actingAs($this->admin)
        ->put("/admin/cotizaciones/{$quote->id}", [
            'vence_el' => now()->addDay()->toDateString(),
            'descuento' => '0.00',
            'items' => [
                ['product_id' => null, 'descripcion' => 'Otro', 'cantidad' => '1', 'precio_unitario' => '10.00'],
            ],
        ])
        ->assertForbidden();
});

it('no envía una cotización sin ítems', function () {
    Mail::fake();
    $solicitud = QuoteRequest::factory()->create();
    $quote = Quote::factory()->for($solicitud, 'quoteRequest')->create(['estado' => QuoteEstado::Borrador]);

    $this->actingAs($this->admin)
        ->post("/admin/cotizaciones/{$quote->id}/enviar")
        ->assertForbidden();

    Mail::assertNothingQueued();
});

it('descarga el PDF de la cotización', function () {
    $solicitud = solicitudConItems();
    $this->actingAs($this->admin)->post("/admin/cotizaciones/{$solicitud->id}/generar");
    $quote = Quote::query()->firstOrFail();

    $response = $this->actingAs($this->admin)->get("/admin/cotizaciones/{$quote->id}/pdf");

    $response->assertOk()->assertHeader('content-type', 'application/pdf');
    expect($response->getContent())->toStartWith('%PDF');
});

it('muestra la bandeja y el detalle de una solicitud', function () {
    $solicitud = solicitudConItems();

    $this->actingAs($this->admin)
        ->get('/admin/cotizaciones')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/cotizaciones/index')
            ->where('solicitudes.data.0.items_count', 2),
        );

    $this->actingAs($this->admin)
        ->get("/admin/cotizaciones/{$solicitud->id}")
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/cotizaciones/show')
            ->where('puede_generar', true)
            ->has('solicitud.items', 2),
        );
});

it('ofrece responder por WhatsApp desde la bandeja, con el total ya calculado', function () {
    $solicitud = solicitudConItems();
    $solicitud->update(['nombre' => 'Lucía Ferreyra', 'telefono' => '351-555-0000']);

    $this->actingAs($this->admin)->post("/admin/cotizaciones/{$solicitud->id}/generar");

    $this->actingAs($this->admin)
        ->get('/admin/cotizaciones')
        ->assertInertia(fn ($page) => $page
            ->where('solicitudes.data.0.cotizacion.total', '3500.00')
            // Es borrador: responder por WhatsApp la va a dar por enviada.
            ->where('solicitudes.data.0.cotizacion.editable', true)
            ->where(
                'solicitudes.data.0.whatsapp_cliente',
                fn (string $url): bool => str_starts_with($url, 'https://wa.me/5493515550000?text=')
                    && str_contains(rawurldecode($url), 'Total: $3.500,00'),
            ),
        );
});

it('marca la cotización como enviada al responder desde la bandeja', function () {
    $solicitud = solicitudConItems();

    $this->actingAs($this->admin)->post("/admin/cotizaciones/{$solicitud->id}/generar");
    $quote = Quote::query()->firstOrFail();

    // Es el mismo endpoint que dispara el botón de responder por WhatsApp.
    $this->actingAs($this->admin)
        ->post("/admin/cotizaciones/{$quote->id}/enviar")
        ->assertSessionHas('exito');

    expect($quote->fresh()->estado)->toBe(QuoteEstado::Enviada)
        ->and($solicitud->fresh()->estado)->toBe(QuoteRequestEstado::Cotizada);

    // Ya enviada: la bandeja deja de ofrecer marcarla, aunque el chat siga abierto.
    $this->actingAs($this->admin)
        ->get('/admin/cotizaciones')
        ->assertInertia(fn ($page) => $page
            ->where('solicitudes.data.0.cotizacion.editable', false)
            ->where('solicitudes.data.0.whatsapp_cliente', fn (string $url): bool => $url !== ''),
        );
});

it('no ofrece WhatsApp en la bandeja si la solicitud todavía no tiene cotización', function () {
    solicitudConItems();

    $this->actingAs($this->admin)
        ->get('/admin/cotizaciones')
        ->assertInertia(fn ($page) => $page
            ->where('solicitudes.data.0.cotizacion', null)
            ->where('solicitudes.data.0.whatsapp_cliente', null),
        );
});

it('cambia el estado de una solicitud a mano pero no a cotizada', function () {
    $solicitud = QuoteRequest::factory()->create();

    $this->actingAs($this->admin)
        ->patch("/admin/cotizaciones/{$solicitud->id}/estado", ['estado' => 'rechazada'])
        ->assertSessionHas('exito');

    expect($solicitud->fresh()->estado)->toBe(QuoteRequestEstado::Rechazada);

    $this->actingAs($this->admin)
        ->patch("/admin/cotizaciones/{$solicitud->id}/estado", ['estado' => 'cotizada'])
        ->assertSessionHasErrors('estado');
});

it('elimina la solicitud junto con su cotización y los ítems de ambas', function () {
    $solicitud = solicitudConItems();
    $this->actingAs($this->admin)->post("/admin/cotizaciones/{$solicitud->id}/generar");
    $quote = Quote::query()->firstOrFail();
    $this->actingAs($this->admin)->post("/admin/cotizaciones/{$quote->id}/enviar");

    $this->actingAs($this->admin)
        ->delete("/admin/cotizaciones/{$solicitud->id}")
        ->assertRedirect('/admin/cotizaciones')
        ->assertSessionHas('exito');

    expect(QuoteRequest::query()->count())->toBe(0)
        ->and(QuoteRequestItem::query()->count())->toBe(0)
        ->and(Quote::query()->count())->toBe(0)
        ->and(QuoteItem::query()->count())->toBe(0)
        // Los productos no se tocan.
        ->and(Product::query()->count())->toBe(2);
});

it('elimina una solicitud que todavía no tiene cotización', function () {
    $solicitud = solicitudConItems();

    $this->actingAs($this->admin)
        ->delete("/admin/cotizaciones/{$solicitud->id}")
        ->assertRedirect('/admin/cotizaciones');

    expect(QuoteRequest::query()->count())->toBe(0);
});

it('no deja eliminar solicitudes sin sesión iniciada', function () {
    $solicitud = QuoteRequest::factory()->create();

    $this->delete("/admin/cotizaciones/{$solicitud->id}")
        ->assertRedirect('/login');

    expect($solicitud->fresh())->not->toBeNull();
});
