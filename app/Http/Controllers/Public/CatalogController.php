<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\PublicCategoryResource;
use App\Http\Resources\PublicProductResource;
use App\Models\Category;
use App\Models\Product;
use App\Support\CatalogCache;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Catálogo público. Ni acá ni en el detalle sale un precio: todo pasa por
 * `PublicProductResource`.
 */
class CatalogController extends Controller
{
    public function index(Request $request): Response
    {
        $categoria = $request->string('categoria')->toString();
        $busqueda = $request->string('q')->trim()->toString();

        $productos = Product::query()
            ->activos()
            ->with('category')
            ->when($categoria !== '', fn ($query) => $query->whereHas(
                'category',
                fn ($q) => $q->where('slug', $categoria),
            ))
            ->when($busqueda !== '', fn ($query) => $query->where(
                fn ($q) => $q->where('nombre', 'like', "%{$busqueda}%")
                    ->orWhere('descripcion', 'like', "%{$busqueda}%"),
            ))
            ->ordenados()
            ->paginate(24)
            ->withQueryString()
            ->through(fn (Product $product): array => PublicProductResource::make($product)->resolve());

        // La barra de categorías (con sus conteos) casi no cambia: se cachea y
        // se invalida sola cuando se toca un producto o una categoría.
        $categorias = CatalogCache::remember(
            'categorias',
            fn (): array => PublicCategoryResource::collection(
                Category::query()
                    ->activas()
                    ->withCount(['products' => fn ($query) => $query->where('activo', true)])
                    ->ordenadas()
                    ->get()
                    ->filter(fn (Category $category): bool => $category->products_count > 0)
                    ->values(),
            )->resolve(),
        );

        return Inertia::render('public/catalogo', [
            'productos' => $productos,
            'categorias' => $categorias,
            'filtros' => [
                'categoria' => $categoria === '' ? null : $categoria,
                'q' => $busqueda === '' ? null : $busqueda,
            ],
        ]);
    }

    public function show(Product $product): Response
    {
        abort_unless($product->activo, 404);

        $relacionados = Product::query()
            ->activos()
            ->where('category_id', $product->category_id)
            ->whereKeyNot($product->id)
            ->with('category')
            ->ordenados()
            ->limit(3)
            ->get();

        return Inertia::render('public/producto', [
            'producto' => new PublicProductResource($product->load('category')),
            'relacionados' => PublicProductResource::collection($relacionados),
        ]);
    }
}
