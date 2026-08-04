import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, Plus } from 'lucide-react';
import { useState } from 'react';
import {
    Button,
    PhotoPlaceholder,
    ProductCard,
    QuantityInput,
    UnitBadge,
    useToast,
} from '@/components/ui';
import type { PublicProduct } from '@/components/ui';
import useCotizacion from '@/hooks/use-cotizacion';
import PublicLayout from '@/layouts/public-layout';

type Props = {
    producto: PublicProduct;
    relacionados: PublicProduct[];
};

export default function Producto({ producto, relacionados }: Props) {
    const { agregar } = useCotizacion();
    const { push } = useToast();
    const [cantidad, setCantidad] = useState(1);

    const sumar = (item: PublicProduct, cant: number) => {
        agregar(
            {
                id: item.id,
                slug: item.slug,
                nombre: item.nombre,
                unidad: item.unidad,
            },
            cant,
        );
        push('exito', `Agregaste ${item.nombre} a tu cotización.`);
    };

    return (
        <PublicLayout>
            <Head title={producto.nombre} />

            <div className="mx-auto max-w-6xl px-4 py-8">
                <Link
                    href={
                        producto.categoria
                            ? `/productos?categoria=${producto.categoria.slug}`
                            : '/productos'
                    }
                    className="inline-flex items-center gap-1.5 text-sm text-texto-medio transition-colors hover:text-bordo"
                >
                    <ChevronLeft className="size-4" aria-hidden="true" />
                    {producto.categoria
                        ? producto.categoria.nombre
                        : 'Todos los productos'}
                </Link>

                <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:items-start">
                    {producto.imagen ? (
                        <img
                            src={producto.imagen}
                            alt={producto.nombre}
                            className="aspect-4/3 w-full rounded-lg border border-borde object-cover"
                        />
                    ) : (
                        <PhotoPlaceholder
                            label={producto.nombre.toLowerCase()}
                        />
                    )}

                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <UnitBadge unidad={producto.unidad} />
                            {producto.sku && (
                                <span className="font-mono text-xs text-texto-suave">
                                    SKU {producto.sku}
                                </span>
                            )}
                        </div>

                        <h1 className="mt-3 font-display text-4xl leading-tight text-texto">
                            {producto.nombre}
                        </h1>

                        {producto.descripcion && (
                            <p className="mt-4 text-lg text-texto-medio">
                                {producto.descripcion}
                            </p>
                        )}

                        <p className="mt-4 text-sm text-texto-medio">
                            Se vende {producto.unidad_label ?? 'por unidad'}.
                            Los precios se informan en la cotización, según
                            cantidad y frecuencia de compra.
                        </p>

                        <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-borde pt-6">
                            <QuantityInput
                                value={cantidad}
                                onChange={setCantidad}
                                unidad={producto.unidad}
                                min={producto.unidad === 'kg' ? 0.5 : 1}
                                label={`Cantidad de ${producto.nombre}`}
                            />
                            <Button
                                size="lg"
                                icon={
                                    <Plus
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                }
                                onClick={() => sumar(producto, cantidad)}
                            >
                                Agregar a la cotización
                            </Button>
                        </div>
                    </div>
                </div>

                {relacionados.length > 0 && (
                    <section className="mt-16 border-t border-borde pt-10">
                        <h2 className="font-display text-2xl text-texto">
                            También te puede servir
                        </h2>
                        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {relacionados.map((item) => (
                                <ProductCard
                                    key={item.id}
                                    product={item}
                                    onAdd={sumar}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </PublicLayout>
    );
}
