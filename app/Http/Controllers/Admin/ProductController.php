<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ProductUnidad;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProductRequest;
use App\Http\Requests\Admin\UpdateProductRequest;
use App\Http\Resources\AdminProductResource;
use App\Models\Category;
use App\Models\Product;
use App\Services\ProductImageService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

/**
 * ABM de productos. Acá sí viajan los precios: es la única cara del sistema
 * que los muestra, y está detrás de `role:admin`.
 */
class ProductController extends Controller
{
    public function __construct(private readonly ProductImageService $imagenes) {}

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
            ->through(fn (Product $product): array => AdminProductResource::make($product)->resolve());

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
            'imagen' => $this->configImagen(),
        ]);
    }

    public function store(StoreProductRequest $request): RedirectResponse
    {
        $datos = $request->safe()->except('imagen');

        $imagen = $request->file('imagen');
        $datos['imagen'] = $imagen instanceof UploadedFile
            ? $this->imagenes->guardar($imagen)
            : null;

        $product = Product::create($datos);

        return redirect()
            ->route('admin.productos.index')
            ->with('exito', "Producto «{$product->nombre}» creado.");
    }

    public function edit(Product $product): Response
    {
        Gate::authorize('update', $product);

        return Inertia::render('admin/productos/edit', [
            'producto' => AdminProductResource::make($product->load('category:id,nombre,slug'))->resolve(),
            'categorias' => $this->opcionesCategorias(),
            'unidades' => $this->opcionesUnidades(),
            'imagen' => $this->configImagen(),
        ]);
    }

    public function update(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        $datos = $request->safe()->except(['imagen', 'eliminar_imagen']);
        $anterior = $product->imagen;
        $nueva = $request->file('imagen');

        if ($nueva instanceof UploadedFile) {
            $datos['imagen'] = $this->imagenes->guardar($nueva);
        } elseif ($request->boolean('eliminar_imagen')) {
            $datos['imagen'] = null;
        }

        $product->update($datos);

        // Recién se borra el archivo viejo (y su thumb) cuando la fila ya quedó guardada.
        if ($anterior !== null && array_key_exists('imagen', $datos) && $datos['imagen'] !== $anterior) {
            $this->imagenes->eliminar($anterior);
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

    /**
     * Medidas de la foto, para la ayuda del formulario y el prompt de la IA.
     * Salen de `config/fenix.php`: si mañana el catálogo pide otro tamaño, se
     * cambia ahí y el texto que ve el admin se acomoda solo.
     *
     * @return array{ancho_max: int, alto_sugerido: int, proporcion: string, peso_max_mb: string}
     */
    private function configImagen(): array
    {
        $ancho = (int) config('fenix.imagen_producto.ancho_max');
        $thumbAncho = (int) config('fenix.imagen_producto.thumb_ancho');
        $thumbAlto = (int) config('fenix.imagen_producto.thumb_alto');
        $pesoMb = (int) config('fenix.imagen_producto.peso_max_kb') / 1024;

        // La proporción de la ficha es la del thumbnail: si se cambia una, la
        // tarjeta y el detalle tienen que seguir recortando igual.
        $divisor = max(1, $this->mcd($thumbAncho, $thumbAlto));

        return [
            'ancho_max' => $ancho,
            'alto_sugerido' => (int) round($ancho * $thumbAlto / max(1, $thumbAncho)),
            'proporcion' => intdiv($thumbAncho, $divisor).':'.intdiv($thumbAlto, $divisor),
            'peso_max_mb' => rtrim(rtrim(number_format($pesoMb, 1, ',', ''), '0'), ','),
        ];
    }

    private function mcd(int $a, int $b): int
    {
        return $b === 0 ? $a : $this->mcd($b, $a % $b);
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
