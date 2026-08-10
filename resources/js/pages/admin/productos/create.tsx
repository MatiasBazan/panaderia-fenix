import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';
import ProductoForm from './producto-form';
import type { OpcionCategoria, OpcionUnidad } from './producto-form';

type Props = {
    categorias: OpcionCategoria[];
    unidades: OpcionUnidad[];
};

export default function ProductoCrear({ categorias, unidades }: Props) {
    return (
        <AdminLayout
            title="Nuevo producto"
            description="Cargá los datos y el precio. Podés dejar la foto para después."
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
            <ProductoForm categorias={categorias} unidades={unidades} />
        </AdminLayout>
    );
}
