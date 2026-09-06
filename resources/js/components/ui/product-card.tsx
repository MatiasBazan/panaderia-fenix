import { Link } from '@inertiajs/react';
import { Check, Plus } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { UnidadValue } from '@/lib/estados';
import usePedido, { usePanelPedido } from '@/hooks/use-pedido';
import useAgregarProducto from '@/hooks/use-agregar-producto';
import {
    cantidadConUnidad,
    claveLinea,
    componerVariante,
    varianteInicial,
} from '@/lib/pedido';
import type { VarianteGrupo } from '@/lib/pedido';
import Button from './button';
import { UnitBadge } from './badge';
import PhotoPlaceholder from './photo-placeholder';
import QuantityInput from './quantity-input';
import VarianteSelector from './variante-selector';

/** Espeja `App\Http\Resources\PublicProductResource`. Sin precio, a propósito. */
export type PublicProduct = {
    id: number;
    slug: string;
    nombre: string;
    descripcion: string | null;
    unidad: UnidadValue;
    imagen: string | null;
    imagen_thumb?: string | null;
    sku?: string;
    unidad_label?: string;
    destacado?: boolean;
    variantes?: VarianteGrupo[];
    categoria?: { nombre: string; slug: string };
};

type Props = {
    product: PublicProduct;
    className?: string;
};

/**
 * Tarjeta del catálogo público. No lleva precio y no tiene que parecer rota
 * por eso: el peso visual que ocuparía el precio lo toma la unidad de venta,
 * y el ancla de la tarjeta es el botón de agregar.
 *
 * La tarjeta se agrega sola al pedido: así toda pantalla que la use avisa lo
 * mismo y muestra lo mismo cuando el producto ya está adentro.
 */
export default function ProductCard({ product, className }: Props) {
    const [cantidad, setCantidad] = useState(1);
    const grupos = product.variantes ?? [];
    const [seleccion, setSeleccion] = useState(() => varianteInicial(grupos));
    const agregarProducto = useAgregarProducto();
    const { cantidadDe } = usePedido();
    const { abrir } = usePanelPedido();

    const minimo = product.unidad === 'kg' ? 0.5 : 1;
    const variante = componerVariante(seleccion);
    const enPedido = cantidadDe(claveLinea(product.id, variante));

    const elegir = (indiceGrupo: number, label: string) =>
        setSeleccion((previa) =>
            previa.map((valor, i) => (i === indiceGrupo ? label : valor)),
        );

    const agregar = () => {
        agregarProducto(product, cantidad, variante);
        // Vuelve al mínimo: si el número quedara, el próximo clic sumaría de más.
        setCantidad(minimo);
    };

    return (
        <article
            className={cn(
                'group relative flex flex-col overflow-hidden rounded-xl bg-papel',
                'shadow-xs ring-1 transition-[box-shadow,translate,--tw-ring-color] duration-300 ease-suave',
                'hover:-translate-y-0.5 hover:shadow-md',
                enPedido > 0
                    ? 'ring-dorado'
                    : 'ring-borde hover:ring-dorado/60',
                className,
            )}
        >
            {/* La foto es la mitad del argumento: se acerca apenas al pasar. */}
            <div className="relative overflow-hidden">
                {product.imagen ? (
                    <>
                        <img
                            src={product.imagen_thumb ?? product.imagen}
                            alt=""
                            className="aspect-4/3 w-full object-cover transition-transform duration-700 ease-suave group-hover:scale-[1.045]"
                            width={400}
                            height={300}
                            loading="lazy"
                        />
                        {/* Velo al pie de la foto: separa la imagen del texto. */}
                        <span
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-carbon/18 to-transparent"
                        />
                    </>
                ) : (
                    <PhotoPlaceholder
                        label={product.nombre.toLowerCase()}
                        className="rounded-none ring-0"
                    />
                )}

                {product.destacado && (
                    <span className="absolute top-3 left-3 rounded-sm bg-papel/92 px-2 py-1 font-mono text-[10px] leading-none tracking-[0.14em] text-bordo uppercase backdrop-blur-sm">
                        De la casa
                    </span>
                )}
            </div>

            <div className="flex flex-1 flex-col gap-2 p-5">
                {product.categoria && (
                    <p className="font-mono text-[10px] tracking-[0.16em] text-texto-suave uppercase">
                        {product.categoria.nombre}
                    </p>
                )}

                <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-xl leading-tight text-texto">
                        <Link
                            href={`/productos/${product.slug}`}
                            className="transition-colors after:absolute after:inset-0 hover:text-bordo"
                        >
                            {product.nombre}
                        </Link>
                    </h3>
                    <UnitBadge
                        unidad={product.unidad}
                        className="mt-1 shrink-0"
                    />
                </div>

                {product.descripcion && (
                    <p className="line-clamp-2 text-sm leading-relaxed text-texto-medio">
                        {product.descripcion}
                    </p>
                )}

                {grupos.length > 0 && (
                    <VarianteSelector
                        grupos={grupos}
                        seleccion={seleccion}
                        onElegir={elegir}
                        className="relative z-10 mt-3"
                    />
                )}

                {/* Los controles van por encima del enlace que cubre la tarjeta. */}
                <div className="relative z-10 mt-auto flex items-center gap-2 pt-4">
                    <QuantityInput
                        value={cantidad}
                        onChange={setCantidad}
                        unidad={product.unidad}
                        min={minimo}
                        label={`Cantidad de ${product.nombre}`}
                    />
                    <Button
                        onClick={agregar}
                        icon={<Plus className="size-4" aria-hidden="true" />}
                        className="flex-1"
                    >
                        {enPedido > 0 ? 'Sumar' : 'Agregar'}
                    </Button>
                </div>

                {/* Estado en el pedido: sin esto, agregar dos veces no se nota. */}
                {enPedido > 0 && (
                    <p className="relative z-10 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-texto-medio">
                        <Check
                            className="size-3.5 shrink-0 text-exito"
                            aria-hidden="true"
                        />
                        <span>
                            Llevás{' '}
                            <span className="font-medium text-texto">
                                {cantidadConUnidad(enPedido, product.unidad)}
                            </span>
                        </span>
                        <button
                            type="button"
                            onClick={abrir}
                            className="underline underline-offset-4 hover:text-bordo"
                        >
                            Ver pedido
                        </button>
                    </p>
                )}
            </div>
        </article>
    );
}
