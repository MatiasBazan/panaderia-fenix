import { Link, useForm } from '@inertiajs/react';
import { Button, Checkbox, Input, Select, Thumb } from '@/components/ui';
import { Textarea } from '@/components/ui/input';
import type { UnidadValue } from '@/lib/estados';
import PromptFoto from './prompt-foto';
import VariantesEditor from './variantes-editor';
import type { GrupoEdit } from './variantes-editor';

export type ProductoEdit = {
    id: number;
    category_id: number;
    sku: string;
    nombre: string;
    slug: string;
    descripcion: string | null;
    variantes:
        | {
              nombre: string;
              opciones: { label: string; precio?: string | number | null }[];
          }[]
        | null;
    unidad: UnidadValue;
    precio_base: string;
    imagen: string | null;
    activo: boolean;
    destacado: boolean;
    orden: number;
};

/** Pasa las variantes guardadas al formato del editor (precio siempre texto). */
function variantesParaEditar(producto?: ProductoEdit): GrupoEdit[] {
    return (producto?.variantes ?? []).map((grupo) => ({
        nombre: grupo.nombre,
        opciones: grupo.opciones.map((opcion) => ({
            label: opcion.label,
            precio:
                opcion.precio === null || opcion.precio === undefined
                    ? ''
                    : String(opcion.precio),
        })),
    }));
}

export type OpcionCategoria = { id: number; nombre: string; slug: string };

/** Medidas de la foto. Vienen de `config/fenix.php`, no se escriben acá. */
export type ConfigImagen = {
    ancho_max: number;
    alto_sugerido: number;
    proporcion: string;
    peso_max_mb: string;
};

export type OpcionUnidad = {
    value: string;
    label: string;
    admite_decimales: boolean;
};

type Props = {
    categorias: OpcionCategoria[];
    unidades: OpcionUnidad[];
    imagen: ConfigImagen;
    /** Si viene, el formulario edita; si no, crea. */
    producto?: ProductoEdit;
};

export default function ProductoForm({
    categorias,
    unidades,
    imagen,
    producto,
}: Props) {
    const editando = producto !== undefined;

    const form = useForm<{
        category_id: string;
        sku: string;
        nombre: string;
        slug: string;
        descripcion: string;
        variantes: GrupoEdit[];
        unidad: string;
        precio_base: string;
        activo: boolean;
        destacado: boolean;
        orden: number;
        imagen: File | null;
        eliminar_imagen: boolean;
    }>({
        category_id: producto ? String(producto.category_id) : '',
        sku: producto?.sku ?? '',
        nombre: producto?.nombre ?? '',
        slug: producto?.slug ?? '',
        descripcion: producto?.descripcion ?? '',
        variantes: variantesParaEditar(producto),
        unidad: producto?.unidad ?? '',
        precio_base: producto?.precio_base ?? '',
        activo: producto?.activo ?? true,
        destacado: producto?.destacado ?? false,
        orden: producto?.orden ?? 0,
        imagen: null,
        eliminar_imagen: false,
    });

    const guardar = (e: React.FormEvent) => {
        e.preventDefault();

        // El form es multipart por la foto: las variantes viajan como JSON string
        // y el backend las decodifica. El PUT va como POST + _method para que PHP
        // parsee el multipart.
        form.transform((data) => ({
            ...data,
            variantes: JSON.stringify(data.variantes),
            ...(editando ? { _method: 'put' } : {}),
        }));

        form.post(
            editando ? `/admin/productos/${producto.slug}` : '/admin/productos',
            {
                forceFormData: true,
            },
        );
    };

    return (
        <form onSubmit={guardar} className="grid max-w-2xl gap-5">
            <Input
                label="Nombre"
                required
                value={form.data.nombre}
                error={form.errors.nombre}
                onChange={(e) => form.setData('nombre', e.target.value)}
            />

            <div className="grid gap-5 sm:grid-cols-2">
                <Input
                    label="Código (SKU)"
                    required
                    mono
                    hint="Único. Se guarda en mayúsculas."
                    value={form.data.sku}
                    error={form.errors.sku}
                    onChange={(e) => form.setData('sku', e.target.value)}
                />
                <Input
                    label="Identificador"
                    mono
                    hint="Para la URL. Se arma del nombre si lo dejás vacío."
                    value={form.data.slug}
                    error={form.errors.slug}
                    onChange={(e) => form.setData('slug', e.target.value)}
                />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
                <Select
                    label="Categoría"
                    required
                    placeholder="Elegí una categoría"
                    value={form.data.category_id}
                    error={form.errors.category_id}
                    options={categorias.map((c) => ({
                        value: String(c.id),
                        label: c.nombre,
                    }))}
                    onChange={(e) =>
                        form.setData('category_id', e.target.value)
                    }
                />
                <Select
                    label="Unidad de venta"
                    required
                    placeholder="Elegí una unidad"
                    value={form.data.unidad}
                    error={form.errors.unidad}
                    options={unidades.map((u) => ({
                        value: u.value,
                        label: u.label,
                    }))}
                    onChange={(e) => form.setData('unidad', e.target.value)}
                />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
                <Input
                    label="Precio"
                    required
                    mono
                    type="number"
                    step="0.01"
                    min={0}
                    value={form.data.precio_base}
                    error={form.errors.precio_base}
                    onChange={(e) =>
                        form.setData('precio_base', e.target.value)
                    }
                />
                <Input
                    label="Orden"
                    required
                    type="number"
                    min={0}
                    max={999}
                    hint="Menor primero dentro de su categoría."
                    value={form.data.orden}
                    error={form.errors.orden}
                    onChange={(e) =>
                        form.setData('orden', Number(e.target.value))
                    }
                />
            </div>

            <Textarea
                label="Descripción"
                rows={3}
                hint="Opcional. Se muestra en la ficha del producto."
                value={form.data.descripcion}
                error={form.errors.descripcion}
                onChange={(e) => form.setData('descripcion', e.target.value)}
            />

            <VariantesEditor
                value={form.data.variantes}
                onChange={(variantes) => form.setData('variantes', variantes)}
                error={form.errors.variantes}
            />

            <div className="grid gap-2">
                <span className="text-sm font-medium text-texto">Foto</span>
                <div className="flex items-center gap-4">
                    <Thumb
                        src={
                            producto?.imagen && !form.data.eliminar_imagen
                                ? producto.imagen
                                : null
                        }
                        className="size-16"
                    />
                    <div className="grid gap-1.5">
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(e) =>
                                form.setData(
                                    'imagen',
                                    e.target.files?.[0] ?? null,
                                )
                            }
                            className="text-sm text-texto-medio file:mr-3 file:rounded-md file:border file:border-borde file:bg-papel file:px-3 file:py-1.5 file:text-sm file:text-texto hover:file:border-dorado"
                        />
                        <p className="text-xs text-texto-medio">
                            JPG, PNG o WEBP · hasta {imagen.peso_max_mb} MB ·
                            proporción {imagen.proporcion} (ideal{' '}
                            {imagen.ancho_max}×{imagen.alto_sugerido} px).
                        </p>
                        {editando && producto?.imagen && (
                            <Checkbox
                                label="Quitar la foto actual"
                                checked={form.data.eliminar_imagen}
                                onChange={(e) =>
                                    form.setData(
                                        'eliminar_imagen',
                                        e.target.checked,
                                    )
                                }
                            />
                        )}
                    </div>
                </div>
                {form.errors.imagen && (
                    <p className="text-sm text-error">{form.errors.imagen}</p>
                )}

                <PromptFoto nombre={form.data.nombre} imagen={imagen} />
            </div>

            <div className="flex flex-wrap gap-6">
                <Checkbox
                    label="Activo (visible en el catálogo)"
                    checked={form.data.activo}
                    onChange={(e) => form.setData('activo', e.target.checked)}
                />
                <Checkbox
                    label="Destacado en la portada"
                    checked={form.data.destacado}
                    onChange={(e) =>
                        form.setData('destacado', e.target.checked)
                    }
                />
            </div>

            <div className="flex items-center gap-2 border-t border-borde pt-5">
                <Button type="submit" loading={form.processing}>
                    {editando ? 'Guardar cambios' : 'Crear producto'}
                </Button>
                <Link href="/admin/productos">
                    <Button type="button" variant="secondary">
                        Cancelar
                    </Button>
                </Link>
            </div>
        </form>
    );
}
