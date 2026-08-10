import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';
import ProductoForm from './producto-form';
import type {
    OpcionCategoria,
    OpcionUnidad,
    ProductoEdit,
} from './producto-form';

type Props = {
    producto: ProductoEdit;
    categorias: OpcionCategoria[];
    unidades: OpcionUnidad[];
};

export default function ProductoEditar({
    producto,
    categorias,
    unidades,
}: Props) {
    return (
        <AdminLayout
            title="Editar producto"
            description={producto.nombre}
            actions={
                <Link
                    href="/admin/productos"
                    className="inline-flex items-center gap-1.5 text-sm text-texto-medio hover:text-texto"
                >
                    <ArrowLeft className="size-4" aria-hidden="true" />
                    Volver a productos
                </Link>
            }
        >
            <ProductoForm
                producto={producto}
                categorias={categorias}
                unidades={unidades}
            />
        </AdminLayout>
    );
}
