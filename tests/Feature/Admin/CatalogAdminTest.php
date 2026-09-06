<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();

    // Las páginas React de administración son la fase siguiente: acá se
    // verifica el contrato de props, no que el componente exista.
    config(['inertia.testing.ensure_pages_exist' => false]);
});

it('lista las categorías con la cuenta de productos activos', function () {
    $categoria = Category::factory()->create();
    Product::factory()->count(2)->for($categoria)->create();
    Product::factory()->inactivo()->for($categoria)->create();

    $this->actingAs($this->admin)
        ->get('/admin/categorias')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/categorias/index')
            ->where('categorias.0.productos_count', 3)
            ->where('categorias.0.productos_activos_count', 2),
        );
});

it('crea una categoría derivando el slug del nombre', function () {
    $this->actingAs($this->admin)
        ->post('/admin/categorias', ['nombre' => 'Panes de masa madre', 'orden' => 3, 'activo' => true])
        ->assertRedirect();

    expect(Category::query()->where('slug', 'panes-de-masa-madre')->exists())->toBeTrue();
});

it('no deja borrar una categoría con productos', function () {
    $categoria = Category::factory()->has(Product::factory())->create();

    $this->actingAs($this->admin)
        ->delete("/admin/categorias/{$categoria->slug}")
        ->assertForbidden();

    expect(Category::query()->whereKey($categoria->id)->exists())->toBeTrue();
});

it('borra una categoría vacía', function () {
    $categoria = Category::factory()->create();

    $this->actingAs($this->admin)
        ->delete("/admin/categorias/{$categoria->slug}")
        ->assertSessionHas('exito');

    expect(Category::query()->whereKey($categoria->id)->exists())->toBeFalse();
});

it('crea un producto con foto y lo guarda en el disco público', function () {
    Storage::fake('public');
    $categoria = Category::factory()->create();

    $this->actingAs($this->admin)
        ->post('/admin/productos', [
            'category_id' => $categoria->id,
            'sku' => 'MM-001',
            'nombre' => 'Pan de campo',
            'descripcion' => 'Masa madre, 24 horas de fermentación.',
            'unidad' => 'kg',
            'precio_base' => '4500.00',
            'imagen' => UploadedFile::fake()->image('pan.jpg'),
            'activo' => true,
            'destacado' => false,
            'orden' => 1,
        ])
        ->assertRedirect('/admin/productos');

    $producto = Product::query()->where('sku', 'MM-001')->firstOrFail();

    expect($producto->slug)->toBe('pan-de-campo');
    Storage::disk('public')->assertExists($producto->imagen);
});

it('guarda las variantes que vienen como JSON del formulario', function () {
    $categoria = Category::factory()->create();

    $this->actingAs($this->admin)
        ->post('/admin/productos', [
            'category_id' => $categoria->id,
            'sku' => 'MM-VAR',
            'nombre' => 'Alfajores',
            'unidad' => 'docena',
            'precio_base' => '12800.00',
            // Como lo manda el front: string JSON, con un precio vacío que se descarta.
            'variantes' => json_encode([
                [
                    'nombre' => 'Relleno',
                    'opciones' => [
                        ['label' => 'Chocolate', 'precio' => ''],
                        ['label' => 'Maicena', 'precio' => ''],
                    ],
                ],
                [
                    'nombre' => 'Tamaño',
                    'opciones' => [
                        ['label' => 'Grande', 'precio' => '1500'],
                    ],
                ],
            ]),
            'activo' => true,
            'destacado' => false,
            'orden' => 1,
        ])
        ->assertRedirect('/admin/productos');

    $variantes = Product::query()->where('sku', 'MM-VAR')->sole()->variantes;

    expect($variantes)->toHaveCount(2)
        ->and($variantes[0]['nombre'])->toBe('Relleno')
        ->and($variantes[0]['opciones'][0])->toBe(['label' => 'Chocolate'])
        ->and($variantes[1]['opciones'][0])->toBe(['label' => 'Grande', 'precio' => '1500']);
});

it('rechaza un precio con más de dos decimales', function () {
    $categoria = Category::factory()->create();

    $this->actingAs($this->admin)
        ->post('/admin/productos', [
            'category_id' => $categoria->id,
            'sku' => 'MM-002',
            'nombre' => 'Pan lactal',
            'unidad' => 'unidad',
            'precio_base' => '1200.555',
            'activo' => true,
            'destacado' => false,
            'orden' => 0,
        ])
        ->assertSessionHasErrors('precio_base');
});

it('borra la foto vieja cuando se sube una nueva', function () {
    Storage::fake('public');
    $vieja = UploadedFile::fake()->image('vieja.jpg')->store('productos', 'public');
    $producto = Product::factory()->create(['imagen' => $vieja]);

    $this->actingAs($this->admin)
        ->put("/admin/productos/{$producto->slug}", [
            'category_id' => $producto->category_id,
            'sku' => $producto->sku,
            'nombre' => $producto->nombre,
            'unidad' => $producto->unidad->value,
            'precio_base' => '999.00',
            'imagen' => UploadedFile::fake()->image('nueva.jpg'),
            'eliminar_imagen' => false,
            'activo' => true,
            'destacado' => false,
            'orden' => 0,
        ])
        ->assertRedirect('/admin/productos');

    Storage::disk('public')->assertMissing($vieja);
    expect($producto->fresh()->imagen)->not->toBe($vieja);
});

it('da de baja un producto con soft delete', function () {
    $producto = Product::factory()->create();

    $this->actingAs($this->admin)
        ->delete("/admin/productos/{$producto->slug}")
        ->assertRedirect('/admin/productos');

    expect(Product::query()->whereKey($producto->id)->exists())->toBeFalse()
        ->and(Product::withTrashed()->whereKey($producto->id)->exists())->toBeTrue();
});

it('deriva las medidas de la foto de la configuración', function () {
    config([
        'fenix.imagen_producto.ancho_max' => 1600,
        'fenix.imagen_producto.thumb_ancho' => 800,
        'fenix.imagen_producto.thumb_alto' => 800,
        'fenix.imagen_producto.peso_max_kb' => 5120,
    ]);

    $this->actingAs($this->admin)
        ->get('/admin/productos/create')
        ->assertOk()
        ->assertInertia(
            fn ($page) => $page
                ->where('imagen.ancho_max', 1600)
                ->where('imagen.alto_sugerido', 1600)
                ->where('imagen.proporcion', '1:1')
                ->where('imagen.peso_max_mb', '5'),
        );
});

it('rechaza una foto que pasa el peso configurado', function () {
    Storage::fake('public');
    config(['fenix.imagen_producto.peso_max_kb' => 100]);

    $categoria = Category::factory()->create();

    $this->actingAs($this->admin)
        ->post('/admin/productos', [
            'category_id' => $categoria->id,
            'sku' => 'PAN-TEST-001',
            'nombre' => 'Pan de prueba',
            'descripcion' => null,
            'unidad' => 'kg',
            'precio_base' => '1000.00',
            'activo' => true,
            'destacado' => false,
            'orden' => 0,
            'imagen' => UploadedFile::fake()->image('foto.jpg')->size(200),
        ])
        ->assertSessionHasErrors('imagen');
});
