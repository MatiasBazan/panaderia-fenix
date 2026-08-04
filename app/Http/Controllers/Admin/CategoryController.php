<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCategoryRequest;
use App\Http\Requests\Admin\UpdateCategoryRequest;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

/**
 * ABM de categorías. Son pocas y se editan en la misma pantalla, así que
 * no hay `create` ni `edit`: el listado alcanza.
 */
class CategoryController extends Controller
{
    public function index(): Response
    {
        Gate::authorize('viewAny', Category::class);

        // Los activos salen de una consulta agrupada aparte: un segundo `withCount`
        // con alias haría el mismo trabajo, pero devuelve una propiedad que el
        // modelo no declara.
        $activos = Product::query()
            ->where('activo', true)
            ->selectRaw('category_id, count(*) as total')
            ->groupBy('category_id')
            ->pluck('total', 'category_id');

        $categorias = Category::query()
            ->withCount('products')
            ->ordenadas()
            ->get()
            ->map(fn (Category $category): array => [
                'id' => $category->id,
                'nombre' => $category->nombre,
                'slug' => $category->slug,
                'orden' => $category->orden,
                'activo' => $category->activo,
                'productos_count' => $category->products_count,
                'productos_activos_count' => (int) $activos->get($category->id, 0),
            ]);

        return Inertia::render('admin/categorias/index', [
            'categorias' => $categorias,
        ]);
    }

    public function store(StoreCategoryRequest $request): RedirectResponse
    {
        $category = Category::create($request->validated());

        return back()->with('exito', "Categoría «{$category->nombre}» creada.");
    }

    public function update(UpdateCategoryRequest $request, Category $category): RedirectResponse
    {
        $category->update($request->validated());

        return back()->with('exito', "Categoría «{$category->nombre}» actualizada.");
    }

    public function destroy(Category $category): RedirectResponse
    {
        // `CategoryPolicy::delete` es la que corta si todavía hay productos:
        // la FK es `restrictOnDelete` y no conviene dejar explotar la base.
        Gate::authorize('delete', $category);

        $category->delete();

        return back()->with('exito', "Categoría «{$category->nombre}» eliminada.");
    }
}
