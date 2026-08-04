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

it('deja fuera del catálogo a los productos inactivos', function () {
    $activo = Product::factory()->create();
    Product::factory()->inactivo()->create();

    $this->get('/productos')->assertInertia(
        fn (Assert $page) => $page
            ->component('public/catalogo')
            ->has('productos', 1)
            ->where('productos.0.id', $activo->id),
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
            ->has('productos', 1)
            ->where('productos.0.id', $pan->id)
            ->where('filtros.categoria', 'panes'),
    );
});

it('filtra el catálogo por búsqueda', function () {
    $buscado = Product::factory()->create(['nombre' => 'Pan de campo']);
    Product::factory()->create(['nombre' => 'Torta rogel']);

    $this->get('/productos?q=campo')->assertInertia(
        fn (Assert $page) => $page
            ->has('productos', 1)
            ->where('productos.0.id', $buscado->id),
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
