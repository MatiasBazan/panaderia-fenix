<?php

use App\Enums\QuoteRequestEstado;
use App\Enums\TipoPedido;
use App\Models\Product;
use App\Models\Quote;
use App\Models\QuoteRequest;
use App\Models\QuoteRequestItem;
use App\Models\User;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
});

it('cuenta las solicitudes pendientes en el tablero', function () {
    QuoteRequest::factory()->count(3)->create();

    $this->actingAs($this->admin)
        ->get('/admin')
        ->assertOk()
        ->assertInertia(
            fn ($page) => $page
                ->component('admin/dashboard')
                ->where('metricas.solicitudes_pendientes', 3),
        );
});

it('marca como demoradas las pendientes con más de 48 horas sin respuesta', function () {
    QuoteRequest::factory()->create(['created_at' => now()->subDays(3)]);
    QuoteRequest::factory()->create(['created_at' => now()->subHour()]);
    // Vieja pero ya respondida: no está demorada.
    QuoteRequest::factory()->enEstado(QuoteRequestEstado::Cotizada)->create(['created_at' => now()->subDays(5)]);

    $this->actingAs($this->admin)
        ->get('/admin')
        ->assertInertia(fn ($page) => $page
            ->where('metricas.solicitudes_pendientes', 2)
            ->where('metricas.solicitudes_demoradas', 1),
        );
});

it('arma la serie de catorce días con los huecos en cero', function () {
    QuoteRequest::factory()->count(2)->create(['created_at' => now()]);
    QuoteRequest::factory()->create(['created_at' => now()->subDays(3)]);
    // Fuera de la ventana: no tiene que aparecer en ningún día de la serie.
    QuoteRequest::factory()->create(['created_at' => now()->subDays(30)]);

    $this->actingAs($this->admin)
        ->get('/admin')
        ->assertInertia(function ($page) {
            $serie = $page->toArray()['props']['serie_solicitudes'];

            expect($serie)->toHaveCount(14);
            expect($serie[13])->toMatchArray([
                'dia' => now()->toDateString(),
                'total' => 2,
            ]);
            expect($serie[10])->toMatchArray([
                'dia' => now()->subDays(3)->toDateString(),
                'total' => 1,
            ]);
            expect(array_sum(array_column($serie, 'total')))->toBe(3);

            return $page;
        });
});

it('resume el mes contra el mismo tramo del mes pasado', function () {
    $this->travelTo('2026-09-15 12:00:00');

    QuoteRequest::factory()->create(['tipo' => TipoPedido::Minorista, 'created_at' => '2026-09-02 10:00:00']);
    QuoteRequest::factory()->create(['tipo' => TipoPedido::Mayorista, 'created_at' => '2026-09-10 10:00:00']);
    // Mes pasado, dentro del mismo tramo (1 al 15): cuenta para comparar.
    QuoteRequest::factory()->create(['created_at' => '2026-08-10 10:00:00']);
    // Mes pasado, después del día 15: no entra en la comparación.
    QuoteRequest::factory()->create(['created_at' => '2026-08-25 10:00:00']);

    // Enviada este mes, tres horas después de entrar la solicitud.
    $solicitud = QuoteRequest::factory()->create(['created_at' => '2026-09-14 09:00:00']);
    Quote::factory()->for($solicitud, 'quoteRequest')->enviada()->create([
        'total' => '1000.00',
        'enviada_el' => '2026-09-14 12:00:00',
    ]);
    // Enviada el mes pasado: no suma al monto de este mes.
    Quote::factory()->enviada()->create([
        'total' => '9000.00',
        'enviada_el' => '2026-08-20 12:00:00',
    ]);

    $this->actingAs($this->admin)
        ->get('/admin')
        ->assertInertia(fn ($page) => $page
            // Las dos de arriba, la de la cotización enviada y la que crea la factory de la cotización vieja.
            ->where('mes.solicitudes', 4)
            ->where('mes.solicitudes_mes_anterior', 1)
            ->where('mes.cotizaciones_enviadas', 1)
            ->where('mes.monto_enviado', '1000.00')
            ->where('mes.ticket_promedio', '1000.00')
            ->where('mes.respuesta_minutos', 180),
        );
});

it('lista los eventos de las próximas dos semanas en orden', function () {
    $this->travelTo('2026-09-15 12:00:00');

    QuoteRequest::factory()->create(['nombre' => 'Lejano', 'fecha_evento' => '2026-09-25']);
    QuoteRequest::factory()->create(['nombre' => 'Mañana', 'fecha_evento' => '2026-09-16']);
    QuoteRequest::factory()->create(['nombre' => 'Fuera de rango', 'fecha_evento' => '2026-10-20']);
    QuoteRequest::factory()->enEstado(QuoteRequestEstado::Rechazada)->create(['fecha_evento' => '2026-09-17']);
    QuoteRequest::factory()->create(['nombre' => 'Ya pasó', 'fecha_evento' => '2026-09-10']);

    $this->actingAs($this->admin)
        ->get('/admin')
        ->assertInertia(fn ($page) => $page
            ->has('proximos_eventos', 2)
            ->where('proximos_eventos.0.nombre', 'Mañana')
            ->where('proximos_eventos.0.dias', 1)
            ->where('proximos_eventos.1.nombre', 'Lejano')
            ->where('proximos_eventos.1.dias', 10),
        );
});

it('ordena los más pedidos por cantidad de solicitudes de los últimos 30 días', function () {
    $pan = Product::factory()->create(['nombre' => 'Pan de campo']);
    $medialunas = Product::factory()->create(['nombre' => 'Medialunas']);

    foreach (range(1, 2) as $vez) {
        QuoteRequestItem::factory()->for(QuoteRequest::factory()->create())->create([
            'product_id' => $medialunas->id,
            'cantidad' => '3',
        ]);
    }

    QuoteRequestItem::factory()->for(QuoteRequest::factory()->create())->create([
        'product_id' => $pan->id,
        'cantidad' => '50',
    ]);

    // Viejo: fuera de la ventana de 30 días.
    QuoteRequestItem::factory()
        ->for(QuoteRequest::factory()->create(['created_at' => now()->subDays(40)]))
        ->count(3)
        ->create(['product_id' => $pan->id]);

    $this->actingAs($this->admin)
        ->get('/admin')
        ->assertInertia(fn ($page) => $page
            ->has('mas_pedidos', 2)
            ->where('mas_pedidos.0.nombre', 'Medialunas')
            ->where('mas_pedidos.0.solicitudes', 2)
            ->where('mas_pedidos.1.nombre', 'Pan de campo')
            ->where('mas_pedidos.1.solicitudes', 1),
        );
});

it('cuenta los productos activos sin foto', function () {
    Product::factory()->count(2)->create();
    Product::factory()->create(['imagen' => 'productos/pan.webp']);
    Product::factory()->inactivo()->create();

    $this->actingAs($this->admin)
        ->get('/admin')
        ->assertInertia(fn ($page) => $page
            ->where('metricas.productos_activos', 3)
            ->where('metricas.productos_sin_foto', 2),
        );
});

it('le exige sesión de admin al tablero', function () {
    $this->get('/admin')->assertRedirect('/login');
});
