<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\PublicProductResource;
use App\Models\Product;
use App\Support\Settings;
use Inertia\Inertia;
use Inertia\Response;

class LandingController extends Controller
{
    public function __invoke(Settings $settings): Response
    {
        $destacados = Product::query()
            ->activos()
            ->destacados()
            ->with('category')
            ->ordenados()
            ->limit(6)
            ->get();

        return Inertia::render('public/landing', [
            'destacados' => PublicProductResource::collection($destacados),
            'panaderia' => $settings->datosPanaderia(),
            'fotos' => $this->fotos($settings),
            'zonas' => $settings->zonasEntrega(),
        ]);
    }

    /**
     * Fotos de la landing como URLs listas para el `src`. Los huecos sin foto
     * ni siquiera viajan: el componente cae solo al placeholder.
     *
     * @return array<string, string>
     */
    private function fotos(Settings $settings): array
    {
        return array_map(
            static fn (string $ruta): string => asset('storage/'.$ruta),
            $settings->fotosLanding(),
        );
    }
}
