import { unidadNombres } from '@/lib/estados';
import type { UnidadValue } from '@/lib/estados';
import { quantity } from '@/lib/format';

export type PedidoItem = {
    id: number;
    slug: string;
    nombre: string;
    unidad: UnidadValue;
    cantidad: number;
    /** Miniatura, para que el pedido se lea de un vistazo y no como texto suelto. */
    imagen?: string | null;
    nota?: string;
};

/** Los dos pasos del pedido, compartidos por `/carrito` y `/cotizacion`. */
export const PASOS_PEDIDO = [
    { label: 'Tu pedido', href: '/carrito' },
    { label: 'Tus datos' },
];

/** Cantidad de una línea, ya con su unidad: «2 docenas», «1,5 kg». */
export function cantidadConUnidad(
    cantidad: number,
    unidad: UnidadValue,
): string {
    const nombres = unidadNombres[unidad];

    return `${quantity(cantidad)} ${cantidad === 1 ? nombres.singular : nombres.plural}`;
}

/**
 * Suma las cantidades por unidad de venta: «2 docenas · 1,5 kg». No existe un
 * total único porque docenas y kilos no se suman entre sí — dar un número solo
 * sería mentir, que es justo lo que hacía el contador anterior.
 */
export function resumenPorUnidad(items: PedidoItem[]): string {
    const totales = new Map<UnidadValue, number>();

    items.forEach((item) => {
        totales.set(
            item.unidad,
            (totales.get(item.unidad) ?? 0) + item.cantidad,
        );
    });

    return [...totales.entries()]
        .map(([unidad, total]) => cantidadConUnidad(total, unidad))
        .join(' · ');
}
