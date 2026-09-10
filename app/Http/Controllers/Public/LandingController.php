<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\PublicProductResource;
use App\Models\Category;
use App\Support\Settings;
use Inertia\Inertia;
use Inertia\Response;

class LandingController extends Controller
{
    public function __invoke(Settings $settings): Response
    {
        return Inertia::render('public/landing', [
            'mostrador' => $this->mostrador(),
            'panaderia' => $settings->datosPanaderia(),
            'fotos' => $this->fotos($settings),
            'zonas' => $settings->zonasEntrega(),
        ]);
    }

    /**
     * Todo el catálogo activo, agrupado por categoría y en el orden del
     * mostrador.
     *
     * La landing muestra el surtido entero y no una selección: la panadería es
     * chica y obligar a abrir el catálogo para ver qué hay le costaba pedidos.
     * Las categorías vacías no viajan, así que una categoría recién creada no
     * deja un título colgado.
     *
     * @return array<int, array{nombre: string, slug: string, productos: array<int, array<string, mixed>>}>
     */
    private function mostrador(): array
    {
        return Category::query()
            ->activas()
            ->ordenadas()
            ->with(['products' => fn ($query) => $query->activos()->ordenados()])
            ->get()
            ->filter(fn (Category $categoria): bool => $categoria->products->isNotEmpty())
            ->map(fn (Category $categoria): array => [
                'nombre' => $categoria->nombre,
                'slug' => $categoria->slug,
                'productos' => PublicProductResource::collection($categoria->products)->resolve(),
            ])
            ->values()
            ->all();
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
