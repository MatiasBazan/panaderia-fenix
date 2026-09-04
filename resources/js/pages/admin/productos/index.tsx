import { Link, useForm } from '@inertiajs/react';
import { Package, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
    Badge,
    Button,
    Modal,
    Pagination,
    SearchInput,
    Select,
    Table,
    TBody,
    TD,
    TH,
    THead,
    Thumb,
    TR,
    UnitBadge,
} from '@/components/ui';
import { EmptyState } from '@/components/ui/states';
import { useTableFilters } from '@/hooks/use-table-filters';
import AdminLayout from '@/layouts/admin-layout';
import type { UnidadValue } from '@/lib/estados';
import { money } from '@/lib/format';
import type { Paginated } from '@/types';

type Producto = {
    id: number;
    sku: string;
    nombre: string;
    slug: string;
    unidad: UnidadValue;
    precio_base: string;
    imagen: string | null;
    imagen_thumb: string | null;
    activo: boolean;
    destacado: boolean;
    categoria: { id: number; nombre: string; slug: string } | null;
};

type OpcionCategoria = { id: number; nombre: string; slug: string };

type Filtros = {
    q: string | null;
    categoria: string | null;
    estado: string | null;
};

type Props = {
    productos: Paginated<Producto>;
    categorias: OpcionCategoria[];
    filtros: Filtros;
};

export default function ProductosIndex({
    productos,
    categorias,
    filtros,
}: Props) {
    const { q, setQ, navegar } = useTableFilters('/admin/productos', filtros);
    const [aEliminar, setAEliminar] = useState<Producto | null>(null);
    const eliminarForm = useForm({});

    const eliminar = () => {
        if (!aEliminar) {
            return;
        }

        eliminarForm.delete(`/admin/productos/${aEliminar.slug}`, {
            preserveScroll: true,
            onFinish: () => setAEliminar(null),
        });
    };

    return (
        <AdminLayout
            eyebrow="Catálogo"
            title="Productos"
            description="El catálogo de la panadería. Acá se ven y se editan los precios."
            actions={
                <Link href="/admin/productos/create">
                    <Button icon={<Plus className="size-4" />}>
                        Nuevo producto
                    </Button>
                </Link>
            }
        >
            <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end">
                <SearchInput
                    label="Buscar productos"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Buscar por nombre o código…"
                />

                <Select
                    label="Categoría"
                    className="sm:w-48"
                    placeholder="Todas las categorías"
                    value={filtros.categoria ?? ''}
                    options={categorias.map((c) => ({
                        value: c.slug,
                        label: c.nombre,
                    }))}
                    onChange={(e) => navegar({ categoria: e.target.value })}
                />

                <Select
                    label="Estado"
                    className="sm:w-40"
                    placeholder="Todos"
                    value={filtros.estado ?? ''}
                    options={[
                        { value: 'activo', label: 'Activos' },
                        { value: 'inactivo', label: 'Dados de baja' },
                    ]}
                    onChange={(e) => navegar({ estado: e.target.value })}
                />
            </div>

            {productos.data.length === 0 ? (
                <EmptyState
                    icon={<Package className="size-8" />}
                    title="No hay productos para mostrar"
                    description="Probá con otros filtros o cargá un producto nuevo."
                />
            ) : (
                <div className="grid gap-4">
                    <Table>
                        <THead>
                            <TR>
                                <TH>Producto</TH>
                                <TH>Categoría</TH>
                                <TH>Unidad</TH>
                                <TH numeric>Precio</TH>
                                <TH>Estado</TH>
                                <TH>
                                    <span className="sr-only">Acciones</span>
                                </TH>
                            </TR>
                        </THead>
                        <TBody>
                            {productos.data.map((p) => (
                                <TR key={p.id}>
                                    <TD>
                                        <div className="flex items-center gap-3">
                                            <Thumb
                                                src={p.imagen_thumb ?? p.imagen}
                                                className="size-11"
                                            />
                                            <div>
                                                <Link
                                                    href={`/admin/productos/${p.slug}/edit`}
                                                    className="font-medium text-texto underline-offset-4 hover:text-bordo hover:underline"
                                                >
                                                    {p.nombre}
                                                </Link>
                                                <p className="font-mono text-xs text-texto-suave">
                                                    {p.sku}
                                                    {p.destacado && (
                                                        <span className="ml-2 text-dorado">
                                                            ★ destacado
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </TD>
                                    <TD className="text-texto-medio">
                                        {p.categoria?.nombre ?? '—'}
                                    </TD>
                                    <TD>
                                        <UnitBadge unidad={p.unidad} />
                                    </TD>
                                    <TD numeric>{money(p.precio_base)}</TD>
                                    <TD>
                                        {p.activo ? (
                                            <Badge tone="exito">Activo</Badge>
                                        ) : (
                                            <Badge tone="neutro">Baja</Badge>
                                        )}
                                    </TD>
                                    <TD>
                                        <div className="flex justify-end gap-1">
                                            <Link
                                                href={`/admin/productos/${p.slug}/edit`}
                                            >
                                                <Button
                                                    variant="quiet"
                                                    size="sm"
                                                    icon={
                                                        <Pencil className="size-4" />
                                                    }
                                                >
                                                    Editar
                                                </Button>
                                            </Link>
                                            {p.activo && (
                                                <Button
                                                    variant="quiet"
                                                    size="sm"
                                                    icon={
                                                        <Trash2 className="size-4" />
                                                    }
                                                    onClick={() =>
                                                        setAEliminar(p)
                                                    }
                                                >
                                                    <span className="sr-only">
                                                        Dar de baja
                                                    </span>
                                                </Button>
                                            )}
                                        </div>
                                    </TD>
                                </TR>
                            ))}
                        </TBody>
                    </Table>

                    <Pagination meta={productos} />
                </div>
            )}

            <Modal
                open={aEliminar !== null}
                onClose={() => setAEliminar(null)}
                title="Dar de baja el producto"
                description={
                    aEliminar
                        ? `«${aEliminar.nombre}» deja de mostrarse en el catálogo. Las cotizaciones viejas lo conservan.`
                        : undefined
                }
                footer={
                    <>
                        <Button
                            variant="secondary"
                            onClick={() => setAEliminar(null)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            loading={eliminarForm.processing}
                            onClick={eliminar}
                        >
                            Dar de baja
                        </Button>
                    </>
                }
            />
        </AdminLayout>
    );
}
