<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreSitePhotoRequest;
use App\Services\SiteImageService;
use App\Support\LimiteSubida;
use App\Support\Settings;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Fotos de la landing.
 *
 * No hay modelo detrás: las rutas viven en `settings`, y los huecos los declara
 * `config/fenix.php`. Un slot que no esté en esa config no se puede subir ni
 * borrar — así la URL no es una forma de escribir claves arbitrarias.
 */
class SitePhotoController extends Controller
{
    public function __construct(
        private readonly Settings $settings,
        private readonly SiteImageService $imagenes,
    ) {}

    public function index(): Response
    {
        return Inertia::render('admin/sitio/fotos', [
            'huecos' => $this->huecos(),
            // El máximo que rige, no el que pide la app: si php.ini corta
            // antes, el admin tiene que leer ese número y no el otro.
            'peso_max_mb' => LimiteSubida::texto((int) config('fenix.imagen_sitio.peso_max_kb')),
        ]);
    }

    public function update(StoreSitePhotoRequest $request, string $slot): RedirectResponse
    {
        abort_unless(SiteImageService::esHuecoValido($slot), 404);

        $fotos = $this->settings->fotosLanding();
        $anterior = $fotos[$slot] ?? null;

        $fotos[$slot] = $this->imagenes->guardar($request->file('imagen'), $slot);
        $this->settings->set(Settings::FOTOS_LANDING, $fotos);

        // El archivo viejo recién se borra con la ruta nueva ya guardada: si la
        // escritura fallara, la landing sigue mostrando la foto anterior.
        $this->imagenes->eliminar($anterior);

        return back()->with('exito', 'Foto actualizada.');
    }

    public function destroy(string $slot): RedirectResponse
    {
        abort_unless(SiteImageService::esHuecoValido($slot), 404);

        $fotos = $this->settings->fotosLanding();
        $anterior = $fotos[$slot] ?? null;

        unset($fotos[$slot]);
        $this->settings->set(Settings::FOTOS_LANDING, $fotos);

        $this->imagenes->eliminar($anterior);

        return back()->with('exito', 'Foto quitada. Vuelve a verse el placeholder.');
    }

    /**
     * Los huecos con su foto actual, listos para el formulario.
     *
     * @return list<array{slot: string, label: string, ayuda: string, proporcion: string, ancho: int, url: string|null}>
     */
    private function huecos(): array
    {
        $fotos = $this->settings->fotosLanding();
        $huecos = [];

        foreach (SiteImageService::huecos() as $slot => $hueco) {
            $huecos[] = [
                'slot' => $slot,
                'label' => $hueco['label'],
                'ayuda' => $hueco['ayuda'],
                'proporcion' => $hueco['proporcion'],
                'ancho' => $hueco['ancho'],
                'url' => isset($fotos[$slot]) ? asset('storage/'.$fotos[$slot]) : null,
            ];
        }

        return $huecos;
    }
}
