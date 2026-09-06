import { Head, Link } from '@inertiajs/react';
import { Check, ChevronLeft, Plus } from 'lucide-react';
import { useState } from 'react';
import {
    Button,
    PhotoPlaceholder,
    ProductCard,
    QuantityInput,
    UnitBadge,
    VarianteSelector,
} from '@/components/ui';
import type { PublicProduct } from '@/components/ui';
import useAgregarProducto from '@/hooks/use-agregar-producto';
import usePedido, { usePanelPedido } from '@/hooks/use-pedido';
import PublicLayout from '@/layouts/public-layout';
import {
    cantidadConUnidad,
    claveLinea,
    componerVariante,
    varianteInicial,
} from '@/lib/pedido';

type Props = {
    producto: PublicProduct;
    relacionados: PublicProduct[];
};

export default function Producto({ producto, relacionados }: Props) {
    const agregarProducto = useAgregarProducto();
    const { cantidadDe } = usePedido();
    const { abrir } = usePanelPedido();

    const minimo = producto.unidad === 'kg' ? 0.5 : 1;
    const [cantidad, setCantidad] = useState(minimo);
    const grupos = producto.variantes ?? [];
    const [seleccion, setSeleccion] = useState(() => varianteInicial(grupos));
    const variante = componerVariante(seleccion);
    const enPedido = cantidadDe(claveLinea(producto.id, variante));

    const elegir = (indiceGrupo: number, label: string) =>
        setSeleccion((previa) =>
            previa.map((valor, i) => (i === indiceGrupo ? label : valor)),
        );

    const sumar = () => {
        agregarProducto(producto, cantidad, variante);
        setCantidad(minimo);
    };

    return (
        <PublicLayout>
            <Head title={producto.nombre} />

            <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
                <Link
                    href={
                        producto.categoria
                            ? `/productos?categoria=${producto.categoria.slug}`
                            : '/productos'
                    }
                    className="group inline-flex items-center gap-1.5 text-sm text-texto-medio transition-colors hover:text-bordo"
                >
                    <ChevronLeft
                        className="size-4 transition-transform duration-200 ease-suave group-hover:-translate-x-0.5"
                        aria-hidden="true"
                    />
                    {producto.categoria
                        ? producto.categoria.nombre
                        : 'Todos los productos'}
                </Link>

                <div className="mt-8 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-16">
                    {/* La foto acompaña la lectura mientras se decide la cantidad. */}
                    <div className="lg:sticky lg:top-24">
                        {producto.imagen ? (
                            <img
                                src={producto.imagen}
                                alt={producto.nombre}
                                className="aspect-4/3 w-full rounded-xl object-cover shadow-lg ring-1 ring-borde"
                            />
                        ) : (
                            <PhotoPlaceholder
                                label={producto.nombre.toLowerCase()}
                                className="shadow-lg"
                            />
                        )}
                    </div>

                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            {producto.categoria && (
                                <p className="font-mono text-[11px] tracking-[0.18em] text-texto-suave uppercase">
                                    {producto.categoria.nombre}
                                </p>
                            )}
                            <UnitBadge unidad={producto.unidad} />
                            {producto.sku && (
                                <span className="font-mono text-xs text-texto-suave">
                                    SKU {producto.sku}
                                </span>
                            )}
                        </div>

                        <h1 className="mt-4 font-display text-seccion text-texto">
                            {producto.nombre}
                        </h1>

                        {producto.descripcion && (
                            <p className="mt-5 max-w-prose text-lg leading-relaxed text-texto-medio">
                                {producto.descripcion}
                            </p>
                        )}

                        <p className="mt-6 max-w-prose border-l-2 border-dorado py-1 pl-5 text-sm leading-relaxed text-texto-medio">
                            Se vende {producto.unidad_label ?? 'por unidad'}. No
                            publicamos precios: te los pasamos al responder el
                            pedido, según cantidad y frecuencia de compra.
                        </p>

                        {grupos.length > 0 && (
                            <VarianteSelector
                                grupos={grupos}
                                seleccion={seleccion}
                                onElegir={elegir}
                                className="mt-8"
                            />
                        )}

                        <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-borde pt-8">
                            <QuantityInput
                                value={cantidad}
                                onChange={setCantidad}
                                unidad={producto.unidad}
                                min={minimo}
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
                                onClick={sumar}
                            >
                                {enPedido > 0
                                    ? 'Sumar al pedido'
                                    : 'Agregar al pedido'}
                            </Button>
                        </div>

                        {enPedido > 0 && (
                            <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-texto-medio">
                                <Check
                                    className="size-4 shrink-0 text-exito"
                                    aria-hidden="true"
                                />
                                <span>
                                    Ya llevás{' '}
                                    <span className="font-medium text-texto">
                                        {cantidadConUnidad(
                                            enPedido,
                                            producto.unidad,
                                        )}
                                    </span>{' '}
                                    en tu pedido.
                                </span>
                                <button
                                    type="button"
                                    onClick={abrir}
                                    className="underline decoration-dorado underline-offset-4 hover:text-bordo"
                                >
                                    Ver pedido
                                </button>
                            </p>
                        )}
                    </div>
                </div>

                {relacionados.length > 0 && (
                    <section className="mt-24 border-t border-borde pt-12">
                        <p className="font-mono text-[11px] tracking-[0.2em] text-texto-suave uppercase">
                            De la misma mesa
                        </p>
                        <h2 className="mt-3 font-display text-3xl text-texto">
                            También te puede servir
                        </h2>
                        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {relacionados.map((item) => (
                                <ProductCard key={item.id} product={item} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </PublicLayout>
    );
}
