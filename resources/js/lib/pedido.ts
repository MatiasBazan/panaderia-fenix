import { unidadNombres } from '@/lib/estados';
import type { UnidadValue } from '@/lib/estados';
import { quantity } from '@/lib/format';

export type PedidoItem = {
    id: number;
    slug: string;
    nombre: string;
    unidad: UnidadValue;
    cantidad: number;
    /** Variante elegida, ya legible: «Chocolate · Grande». Ausente si no tiene. */
    variante?: string;
    /** Miniatura, para que el pedido se lea de un vistazo y no como texto suelto. */
    imagen?: string | null;
    nota?: string;
};

/**
 * Identidad de una línea del pedido: mismo producto con dos variantes distintas
 * son dos líneas, no una. Sin variante cae en el id a secas, así que los pedidos
 * viejos (guardados antes de las variantes) siguen funcionando igual.
 */
export function claveLinea(id: number, variante?: string | null): string {
    return variante ? `${id}::${variante}` : String(id);
}

/** Grupo de opciones que un producto ofrece: «Sabor», «Tamaño». Sin precio: es público. */
export type VarianteGrupo = {
    nombre: string;
    opciones: { label: string }[];
};

/** Selección inicial: la primera opción de cada grupo, así siempre hay algo elegido. */
export function varianteInicial(grupos?: VarianteGrupo[] | null): string[] {
    return (grupos ?? []).map((grupo) => grupo.opciones[0]?.label ?? '');
}

/** Arma el texto legible de la variante elegida: «Chocolate · Grande». */
export function componerVariante(seleccion: string[]): string {
    return seleccion.filter(Boolean).join(' · ');
}

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
