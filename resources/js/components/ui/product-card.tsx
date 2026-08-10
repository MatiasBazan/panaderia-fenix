import { Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { UnidadValue } from '@/lib/estados';
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
    onAdd: (product: PublicProduct, cantidad: number) => void;
    className?: string;
};

/**
 * Tarjeta del catálogo público. No lleva precio y no tiene que parecer rota
 * por eso: el peso visual que ocuparía el precio lo toma la unidad de venta,
 * y el ancla de la tarjeta es el botón de agregar.
 */
export default function ProductCard({ product, onAdd, className }: Props) {
    const [cantidad, setCantidad] = useState(1);

    return (
        <article
            className={cn(
                'flex flex-col overflow-hidden rounded-lg border border-borde bg-papel',
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
                        min={product.unidad === 'kg' ? 0.5 : 1}
                        label={`Cantidad de ${product.nombre}`}
                    />
                    <Button
                        onClick={() => onAdd(product, cantidad)}
                        icon={<Plus className="size-4" aria-hidden="true" />}
                        className="flex-1"
                    >
                        Agregar
                    </Button>
                </div>
            </div>
        </article>
    );
}
