import { Link } from '@inertiajs/react';
import { Check, Plus } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { UnidadValue } from '@/lib/estados';
import usePedido, { usePanelPedido } from '@/hooks/use-pedido';
import useAgregarProducto from '@/hooks/use-agregar-producto';
import { cantidadConUnidad } from '@/lib/pedido';
import Button from './button';
import { UnitBadge } from './badge';
import PhotoPlaceholder from './photo-placeholder';
import QuantityInput from './quantity-input';

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
    const agregarProducto = useAgregarProducto();
    const { cantidadDe } = usePedido();
    const { abrir } = usePanelPedido();

    const minimo = product.unidad === 'kg' ? 0.5 : 1;
    const enPedido = cantidadDe(product.id);

    const agregar = () => {
        agregarProducto(product, cantidad);
        // Vuelve al mínimo: si el número quedara, el próximo clic sumaría de más.
        setCantidad(minimo);
    };

    return (
        <article
            className={cn(
                'flex flex-col overflow-hidden rounded-lg border bg-papel transition-colors',
                enPedido > 0 ? 'border-dorado' : 'border-borde',
                className,
            )}
        >
            <Link href={`/productos/${product.slug}`} className="block">
                {product.imagen ? (
                    <img
                        src={product.imagen_thumb ?? product.imagen}
                        alt={product.nombre}
                        className="aspect-4/3 w-full object-cover"
                        width={400}
                        height={300}
                        loading="lazy"
                    />
                ) : (
                    <PhotoPlaceholder
                        label={product.nombre.toLowerCase()}
                        className="rounded-none border-0 border-b border-borde"
                    />
                )}
            </Link>

            <div className="flex flex-1 flex-col gap-2 p-4">
                <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base leading-snug font-semibold text-texto">
                        <Link
                            href={`/productos/${product.slug}`}
                            className="transition-colors hover:text-bordo"
                        >
                            {product.nombre}
                        </Link>
                    </h3>
                    <UnitBadge unidad={product.unidad} className="mt-0.5 shrink-0" />
                </div>

                {product.descripcion && (
                    <p className="line-clamp-2 text-sm text-texto-medio">{product.descripcion}</p>
                )}

                <div className="mt-auto flex items-center gap-2 pt-3">
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
                    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-texto-medio">
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
