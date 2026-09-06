<?php

use App\Models\Category;
use App\Models\Product;
use Inertia\Testing\AssertableInertia as Assert;

/**
 * La regla más importante del sitio público: no se filtra un precio por
 * ningún lado. Se revisa el HTML crudo, no sólo las props que esperamos.
 */
function assertSinPrecios(string $contenido, string $precio): void
{
    expect($contenido)
        ->not->toContain('precio_base')
        ->not->toContain('precio_unitario')
        ->not->toContain($precio);
}

it('no expone precios en la landing', function () {
    Product::factory()->destacado()->conPrecio('13579.24')->create();

    $response = $this->get('/');

    $response->assertOk();
    assertSinPrecios($response->getContent(), '13579.24');
});

it('no expone precios en el catálogo', function () {
    Product::factory()->count(3)->conPrecio('24680.13')->create();

    $response = $this->get('/productos');

    $response->assertOk();
    assertSinPrecios($response->getContent(), '24680.13');
});

it('no expone precios en el detalle de un producto', function () {
    $product = Product::factory()->conPrecio('97531.86')->create();

    $response = $this->get("/productos/{$product->slug}");

    $response->assertOk();
    assertSinPrecios($response->getContent(), '97531.86');
});

it('no expone precios en la pantalla de cotización', function () {
    $product = Product::factory()->conPrecio('86420.97')->create();

    $response = $this->get("/cotizacion?items={$product->id}");

    $response->assertOk();
    assertSinPrecios($response->getContent(), '86420.97');
});

it('no expone precios en el carrito', function () {
    $product = Product::factory()->conPrecio('75319.84')->create();

    $response = $this->get("/carrito?items={$product->id}");

    $response->assertOk();
    assertSinPrecios($response->getContent(), '75319.84');
});

it('muestra las variantes pero nunca su precio interno', function () {
    $product = Product::factory()->create([
        'variantes' => [
            [
                'nombre' => 'Tamaño',
                'opciones' => [
                    ['label' => 'Grande', 'precio' => '54321.99'],
                    ['label' => 'Chico', 'precio' => '12345.67'],
                ],
            ],
        ],
    ]);

    $response = $this->get("/productos/{$product->slug}");

    $response->assertOk();
    // La etiqueta llega al catálogo; el precio de referencia, jamás.
    expect($response->getContent())
        ->toContain('Grande')
        ->not->toContain('54321.99')
        ->not->toContain('12345.67');
});

it('el carrito sólo devuelve los productos vigentes que le pasan', function () {
    $activo = Product::factory()->create();
    $inactivo = Product::factory()->inactivo()->create();
    // Existe pero no lo pidieron: no tiene que aparecer.
    Product::factory()->create();

    $this->get("/carrito?items={$activo->id},{$inactivo->id}")->assertInertia(
        fn (Assert $page) => $page
            ->component('public/carrito')
            ->has('productos', 1)
            ->where('productos.0.id', $activo->id)
            ->where('consultados', [$activo->id, $inactivo->id]),
    );
});

it('el carrito aguanta una lista vacía o con basura', function () {
    $this->get('/carrito')->assertInertia(
        fn (Assert $page) => $page->component('public/carrito')->has('productos', 0),
    );

    $this->get('/carrito?items=,,abc,0,-3')->assertInertia(
        fn (Assert $page) => $page->has('productos', 0),
    );
});

/**
 * Sin ids no hay nada consultado, y el front distingue eso de «los dieron de
 * baja»: entrar a `/carrito` a mano no puede acusar de baja a un pedido entero.
 */
it('no informa productos consultados cuando no le pasaron ninguno', function () {
    Product::factory()->count(3)->create();

    $this->get('/carrito')->assertInertia(
        fn (Assert $page) => $page->where('consultados', []),
    );

    $this->get('/cotizacion')->assertInertia(
        fn (Assert $page) => $page->component('public/cotizacion')->where('consultados', []),
    );
});

it('el paso 2 informa qué ids consultó', function () {
    $activo = Product::factory()->create();
    $inactivo = Product::factory()->inactivo()->create();

    $this->get("/cotizacion?items={$activo->id},{$inactivo->id}")->assertInertia(
        fn (Assert $page) => $page
            ->has('productos', 1)
            ->where('productos.0.id', $activo->id)
            ->where('consultados', [$activo->id, $inactivo->id]),
    );
});

it('deja fuera del catálogo a los productos inactivos', function () {
    $activo = Product::factory()->create();
    Product::factory()->inactivo()->create();

    $this->get('/productos')->assertInertia(
        fn (Assert $page) => $page
            ->component('public/catalogo')
            ->has('productos.data', 1)
            ->where('productos.data.0.id', $activo->id),
    );
});

it('devuelve 404 en el detalle de un producto inactivo', function () {
    $product = Product::factory()->inactivo()->create();

    $this->get("/productos/{$product->slug}")->assertNotFound();
});

it('filtra el catálogo por categoría', function () {
    $panes = Category::factory()->create(['slug' => 'panes']);
    $facturas = Category::factory()->create(['slug' => 'facturas']);

    $pan = Product::factory()->for($panes)->create();
    Product::factory()->for($facturas)->create();

    $this->get('/productos?categoria=panes')->assertInertia(
        fn (Assert $page) => $page
            ->has('productos.data', 1)
            ->where('productos.data.0.id', $pan->id)
            ->where('filtros.categoria', 'panes'),
    );
});

it('filtra el catálogo por búsqueda', function () {
    $buscado = Product::factory()->create(['nombre' => 'Pan de campo']);
    Product::factory()->create(['nombre' => 'Torta rogel']);

    $this->get('/productos?q=campo')->assertInertia(
        fn (Assert $page) => $page
            ->has('productos.data', 1)
            ->where('productos.data.0.id', $buscado->id),
    );
});

it('sólo muestra destacados activos en la landing', function () {
    $destacado = Product::factory()->destacado()->create();
    Product::factory()->destacado()->inactivo()->create();
    Product::factory()->create();

    $this->get('/')->assertInertia(
        fn (Assert $page) => $page
            ->component('public/landing')
            ->has('destacados', 1)
            ->where('destacados.0.id', $destacado->id),
    );
});
