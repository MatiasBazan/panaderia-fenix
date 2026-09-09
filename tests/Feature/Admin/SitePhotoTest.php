<?php

use App\Models\User;
use App\Services\SiteImageService;
use App\Support\LimiteSubida;
use App\Support\Settings;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('public');

    $this->admin = User::factory()->admin()->create();
    $this->settings = app(Settings::class);

    config(['inertia.testing.ensure_pages_exist' => false]);
});

/** Foto de prueba con medidas reales: el servicio la decodifica de verdad. */
function fotoDePrueba(int $ancho = 2400, int $alto = 1600): UploadedFile
{
    return UploadedFile::fake()->image('mostrador.jpg', $ancho, $alto);
}

it('lista los huecos declarados en config, vacíos al principio', function () {
    $this->actingAs($this->admin)
        ->get('/admin/sitio/fotos')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/sitio/fotos')
            ->has('huecos', 3)
            ->where('huecos.0.slot', 'mostrador')
            ->where('huecos.0.url', null),
        );
});

it('sube una foto, la guarda como webp y la deja en settings', function () {
    $this->actingAs($this->admin)
        ->post('/admin/sitio/fotos/mostrador', ['imagen' => fotoDePrueba()])
        ->assertRedirect();

    $ruta = $this->settings->fotosLanding()['mostrador'] ?? null;

    expect($ruta)->toBeString()
        ->and($ruta)->toStartWith(SiteImageService::DIR.'/')
        ->and($ruta)->toEndWith('.webp');

    Storage::disk('public')->assertExists($ruta);
});

it('acota el ancho de la foto al que declara el hueco', function () {
    $this->actingAs($this->admin)
        ->post('/admin/sitio/fotos/miga', ['imagen' => fotoDePrueba(2400, 2400)]);

    $ruta = $this->settings->fotosLanding()['miga'];
    $imagen = getimagesizefromstring((string) Storage::disk('public')->get($ruta));

    // `miga` está declarado en 800 px; el original venía en 2400.
    expect($imagen[0])->toBe(SiteImageService::anchoDe('miga'));
});

it('borra la foto anterior cuando se sube una nueva en el mismo hueco', function () {
    $this->actingAs($this->admin)
        ->post('/admin/sitio/fotos/mostrador', ['imagen' => fotoDePrueba()]);

    $primera = $this->settings->fotosLanding()['mostrador'];

    $this->actingAs($this->admin)
        ->post('/admin/sitio/fotos/mostrador', ['imagen' => fotoDePrueba()]);

    $segunda = $this->settings->fotosLanding()['mostrador'];

    expect($segunda)->not->toBe($primera);
    Storage::disk('public')->assertMissing($primera);
    Storage::disk('public')->assertExists($segunda);
});

it('quita la foto y borra el archivo', function () {
    $this->actingAs($this->admin)
        ->post('/admin/sitio/fotos/amasado', ['imagen' => fotoDePrueba()]);

    $ruta = $this->settings->fotosLanding()['amasado'];

    $this->actingAs($this->admin)
        ->delete('/admin/sitio/fotos/amasado')
        ->assertRedirect();

    expect($this->settings->fotosLanding())->not->toHaveKey('amasado');
    Storage::disk('public')->assertMissing($ruta);
});

it('da 404 en un hueco que no está declarado en config', function () {
    $this->actingAs($this->admin)
        ->post('/admin/sitio/fotos/inventado', ['imagen' => fotoDePrueba()])
        ->assertNotFound();

    expect($this->settings->fotosLanding())->toBe([]);
});

it('rechaza un archivo que no es imagen', function () {
    $this->actingAs($this->admin)
        ->post('/admin/sitio/fotos/mostrador', [
            'imagen' => UploadedFile::fake()->create('precios.pdf', 20, 'application/pdf'),
        ])
        ->assertSessionHasErrors('imagen');

    expect($this->settings->fotosLanding())->toBe([]);
});

it('no deja entrar a un visitante anónimo', function () {
    $this->get('/admin/sitio/fotos')->assertRedirect('/login');
    $this->post('/admin/sitio/fotos/mostrador', ['imagen' => fotoDePrueba()])
        ->assertRedirect('/login');
});

it('la landing sirve la foto cargada y omite los huecos vacíos', function () {
    $this->actingAs($this->admin)
        ->post('/admin/sitio/fotos/mostrador', ['imagen' => fotoDePrueba()]);

    $this->get('/')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('public/landing')
            ->has('fotos.mostrador')
            ->missing('fotos.miga')
            ->missing('fotos.amasado'),
        );
});

it('avisa que la foto superó el techo del servidor en vez de culpar al formato', function () {
    // Lo que hace PHP cuando el archivo pasa `upload_max_filesize`: lo entrega
    // vacío y con el código de error puesto.
    $descartada = new UploadedFile(
        fotoDePrueba()->getPathname(),
        'mostrador.jpg',
        'image/jpeg',
        UPLOAD_ERR_INI_SIZE,
        true,
    );

    $this->actingAs($this->admin)
        ->post('/admin/sitio/fotos/mostrador', ['imagen' => $descartada])
        ->assertSessionHasErrors(['imagen' => 'La foto pesa más de los '
            .LimiteSubida::texto((int) config('fenix.imagen_sitio.peso_max_kb'))
            .' MB que acepta el servidor. Probá con una más liviana.']);

    expect($this->settings->fotosLanding())->toBe([]);
});

it('nunca deja pasar un máximo mayor al que acepta el servidor', function () {
    // Un pedido chico manda porque ninguna directiva de PHP baja de 1 KB.
    expect(LimiteSubida::kb(1))->toBe(1);

    // Uno grande queda acotado por php.ini, sea cual sea el de esta máquina.
    $pedido = 10240;
    $limite = LimiteSubida::kb($pedido);

    expect($limite)->toBeGreaterThan(0)
        ->and($limite)->toBeLessThanOrEqual($pedido)
        ->and(LimiteSubida::servidorMandaSobre($pedido))
        ->toBe($limite < $pedido);
});

it('la pantalla publica el máximo que rige de verdad', function () {
    $this->actingAs($this->admin)
        ->get('/admin/sitio/fotos')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('peso_max_mb', LimiteSubida::texto(
                (int) config('fenix.imagen_sitio.peso_max_kb'),
            )),
        );
});
