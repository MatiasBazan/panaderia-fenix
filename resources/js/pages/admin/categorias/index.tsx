import { router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Tags, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
    Badge,
    Button,
    Checkbox,
    Input,
    Modal,
    Table,
    TBody,
    TD,
    TH,
    THead,
    TR,
} from '@/components/ui';
import { EmptyState } from '@/components/ui/states';
import AdminLayout from '@/layouts/admin-layout';

type Categoria = {
    id: number;
    nombre: string;
    slug: string;
    orden: number;
    activo: boolean;
    productos_count: number;
    productos_activos_count: number;
};

type Props = {
    categorias: Categoria[];
};

export default function CategoriasIndex({ categorias }: Props) {
    const [abierto, setAbierto] = useState(false);
    const [editando, setEditando] = useState<Categoria | null>(null);
    const [aEliminar, setAEliminar] = useState<Categoria | null>(null);

    const form = useForm({
        nombre: '',
        slug: '',
        orden: 0,
        activo: true,
    });

    const abrirNueva = () => {
        setEditando(null);
        form.reset();
        form.clearErrors();
        setAbierto(true);
    };

    const abrirEdicion = (categoria: Categoria) => {
        setEditando(categoria);
        form.clearErrors();
        form.setData({
            nombre: categoria.nombre,
            slug: categoria.slug,
            orden: categoria.orden,
            activo: categoria.activo,
        });
        setAbierto(true);
    };

    const cerrar = () => {
        setAbierto(false);
        setEditando(null);
    };

    const guardar = (e: React.FormEvent) => {
        e.preventDefault();

        const opciones = {
            preserveScroll: true,
            onSuccess: () => cerrar(),
        };

        if (editando) {
            form.put(`/admin/categorias/${editando.slug}`, opciones);
        } else {
            form.post('/admin/categorias', opciones);
        }
    };

    const eliminar = () => {
        if (!aEliminar) {
            return;
        }

        router.delete(`/admin/categorias/${aEliminar.slug}`, {
            preserveScroll: true,
            onFinish: () => setAEliminar(null),
        });
    };

    return (
        <AdminLayout
            title="Categorías"
            description="Agrupan el catálogo. Se ordenan por el número de orden."
            actions={
                <Button icon={<Plus className="size-4" />} onClick={abrirNueva}>
                    Nueva categoría
                </Button>
            }
        >
            {categorias.length === 0 ? (
                <EmptyState
                    icon={<Tags className="size-8" />}
                    title="Todavía no hay categorías"
                    description="Creá la primera para poder clasificar los productos."
                    action={
                        <Button
                            icon={<Plus className="size-4" />}
                            onClick={abrirNueva}
                        >
                            Nueva categoría
                        </Button>
                    }
                />
            ) : (
                <Table>
                    <THead>
                        <TR>
                            <TH numeric>Orden</TH>
                            <TH>Nombre</TH>
                            <TH>Identificador</TH>
                            <TH numeric>Productos</TH>
                            <TH>Estado</TH>
                            <TH>
                                <span className="sr-only">Acciones</span>
                            </TH>
                        </TR>
                    </THead>
                    <TBody>
                        {categorias.map((c) => (
                            <TR key={c.id}>
                                <TD numeric className="text-texto-medio">
                                    {c.orden}
                                </TD>
                                <TD className="font-medium">{c.nombre}</TD>
                                <TD className="font-mono text-xs text-texto-medio">
                                    {c.slug}
                                </TD>
                                <TD numeric>
                                    {c.productos_activos_count}
                                    <span className="text-texto-suave">
                                        {' / '}
                                        {c.productos_count}
                                    </span>
                                </TD>
                                <TD>
                                    {c.activo ? (
                                        <Badge tone="exito">Activa</Badge>
                                    ) : (
                                        <Badge tone="neutro">Oculta</Badge>
                                    )}
                                </TD>
                                <TD>
                                    <div className="flex justify-end gap-1">
                                        <Button
                                            variant="quiet"
                                            size="sm"
                                            icon={<Pencil className="size-4" />}
                                            onClick={() => abrirEdicion(c)}
                                        >
                                            Editar
                                        </Button>
                                        <Button
                                            variant="quiet"
                                            size="sm"
                                            icon={<Trash2 className="size-4" />}
                                            disabled={c.productos_count > 0}
                                            title={
                                                c.productos_count > 0
                                                    ? 'No se puede eliminar: tiene productos asociados.'
                                                    : undefined
                                            }
                                            onClick={() => setAEliminar(c)}
                                        >
                                            <span className="sr-only">
                                                Eliminar
                                            </span>
                                        </Button>
                                    </div>
                                </TD>
                            </TR>
                        ))}
                    </TBody>
                </Table>
            )}

            <Modal
                open={abierto}
                onClose={cerrar}
                title={editando ? 'Editar categoría' : 'Nueva categoría'}
                description="El identificador se arma solo desde el nombre si lo dejás vacío."
                footer={
                    <>
                        <Button variant="secondary" onClick={cerrar}>
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            form="categoria-form"
                            loading={form.processing}
                        >
                            {editando ? 'Guardar cambios' : 'Crear categoría'}
                        </Button>
                    </>
                }
            >
                <form
                    id="categoria-form"
                    onSubmit={guardar}
                    className="grid gap-4"
                >
                    <Input
                        label="Nombre"
                        required
                        value={form.data.nombre}
                        error={form.errors.nombre}
                        onChange={(e) => form.setData('nombre', e.target.value)}
                    />
                    <Input
                        label="Identificador"
                        hint="Se usa en la URL del catálogo. Opcional."
                        mono
                        value={form.data.slug}
                        error={form.errors.slug}
                        onChange={(e) => form.setData('slug', e.target.value)}
                    />
                    <Input
                        label="Orden"
                        type="number"
                        min={0}
                        max={999}
                        required
                        value={form.data.orden}
                        error={form.errors.orden}
                        onChange={(e) =>
                            form.setData('orden', Number(e.target.value))
                        }
                    />
                    <Checkbox
                        label="Visible en el catálogo"
                        checked={form.data.activo}
                        onChange={(e) => form.setData('activo', e.target.checked)}
                    />
                </form>
            </Modal>

            <Modal
                open={aEliminar !== null}
                onClose={() => setAEliminar(null)}
                title="Eliminar categoría"
                description={
                    aEliminar
                        ? `«${aEliminar.nombre}» se va a eliminar. Esta acción no se puede deshacer.`
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
                        <Button variant="destructive" onClick={eliminar}>
                            Eliminar
                        </Button>
                    </>
                }
            />
        </AdminLayout>
    );
}
