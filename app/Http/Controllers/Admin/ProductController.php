<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ProductUnidad;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProductRequest;
use App\Http\Requests\Admin\UpdateProductRequest;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

/**
 * ABM de productos. Acá sí viajan los precios: es la única cara del sistema
 * que los muestra, y está detrás de `role:admin`.
 */
class ProductController extends Controller
{
    /** Carpeta de las fotos dentro del disco `public`. */
    private const IMAGENES_DIR = 'productos';

    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Product::class);

        $busqueda = $request->string('q')->trim()->toString();
        $categoria = $request->string('categoria')->toString();
        $estado = $request->string('estado')->toString();

        $productos = Product::query()
            ->with('category:id,nombre,slug')
            ->when($busqueda !== '', fn ($query) => $query->where(
                fn ($q) => $q->where('nombre', 'like', "%{$busqueda}%")
                    ->orWhere('sku', 'like', "%{$busqueda}%"),
            ))
            ->when($categoria !== '', fn ($query) => $query->whereHas(
                'category',
                fn ($q) => $q->where('slug', $categoria),
            ))
            ->when($estado === 'activo', fn ($query) => $query->where('activo', true))
            ->when($estado === 'inactivo', fn ($query) => $query->where('activo', false))
            ->ordenados()
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Product $product): array => $this->toArray($product));

        return Inertia::render('admin/productos/index', [
            'productos' => $productos,
            'categorias' => $this->opcionesCategorias(),
            'filtros' => [
                'q' => $busqueda === '' ? null : $busqueda,
                'categoria' => $categoria === '' ? null : $categoria,
                'estado' => $estado === '' ? null : $estado,
            ],
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Product::class);

        return Inertia::render('admin/productos/create', [
            'categorias' => $this->opcionesCategorias(),
            'unidades' => $this->opcionesUnidades(),
        ]);
    }

    public function store(StoreProductRequest $request): RedirectResponse
    {
        $datos = $request->safe()->except('imagen');
        $datos['imagen'] = $this->guardarImagen($request->file('imagen'));

        $product = Product::create($datos);

        return redirect()
            ->route('admin.productos.index')
            ->with('exito', "Producto «{$product->nombre}» creado.");
    }

    public function edit(Product $product): Response
    {
        Gate::authorize('update', $product);

        return Inertia::render('admin/productos/edit', [
            'producto' => $this->toArray($product->load('category:id,nombre,slug')),
            'categorias' => $this->opcionesCategorias(),
            'unidades' => $this->opcionesUnidades(),
        ]);
    }

    public function update(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        $datos = $request->safe()->except(['imagen', 'eliminar_imagen']);
        $anterior = $product->imagen;
        $nueva = $request->file('imagen');

        if ($nueva instanceof UploadedFile) {
            $datos['imagen'] = $this->guardarImagen($nueva);
        } elseif ($request->boolean('eliminar_imagen')) {
            $datos['imagen'] = null;
        }

        $product->update($datos);

        // Recién se borra el archivo viejo cuando la fila ya quedó guardada.
        if ($anterior !== null && array_key_exists('imagen', $datos) && $datos['imagen'] !== $anterior) {
            Storage::disk('public')->delete($anterior);
        }

        return redirect()
            ->route('admin.productos.index')
            ->with('exito', "Producto «{$product->nombre}» actualizado.");
    }

    public function destroy(Product $product): RedirectResponse
    {
        Gate::authorize('delete', $product);

        // Soft delete: la foto y la fila quedan, porque cotizaciones y pedidos
        // viejos siguen apuntando a este producto.
        $product->delete();

        return redirect()
            ->route('admin.productos.index')
            ->with('exito', "Producto «{$product->nombre}» dado de baja.");
    }

    private function guardarImagen(?UploadedFile $imagen): ?string
    {
        if (! $imagen instanceof UploadedFile) {
            return null;
        }

        return $imagen->store(self::IMAGENES_DIR, 'public') ?: null;
    }

    /**
     * @return array<string, mixed>
     */
    private function toArray(Product $product): array
    {
        return [
            'id' => $product->id,
            'category_id' => $product->category_id,
            'sku' => $product->sku,
            'nombre' => $product->nombre,
            'slug' => $product->slug,
            'descripcion' => $product->descripcion,
            'unidad' => $product->unidad->value,
            'unidad_label' => $product->unidad->label(),
            'precio_base' => (string) $product->precio_base,
            'imagen' => $product->imagen === null ? null : asset('storage/'.$product->imagen),
            'activo' => $product->activo,
            'destacado' => $product->destacado,
            'orden' => $product->orden,
            'categoria' => $product->relationLoaded('category') ? [
                'id' => $product->category->id,
                'nombre' => $product->category->nombre,
                'slug' => $product->category->slug,
            ] : null,
        ];
    }

    /**
     * @return list<array{id: int, nombre: string, slug: string, activo: bool}>
     */
    private function opcionesCategorias(): array
    {
        return array_values(
            Category::query()
                ->ordenadas()
                ->get()
                ->map(fn (Category $category): array => [
                    'id' => $category->id,
                    'nombre' => $category->nombre,
                    'slug' => $category->slug,
                    'activo' => $category->activo,
                ])
                ->all(),
        );
    }

    /**
     * @return list<array{value: string, label: string, admite_decimales: bool}>
     */
    private function opcionesUnidades(): array
    {
        return array_map(
            fn (ProductUnidad $unidad): array => [
                'value' => $unidad->value,
                'label' => $unidad->label(),
                'admite_decimales' => $unidad->admiteDecimales(),
            ],
            ProductUnidad::cases(),
        );
    }
}
