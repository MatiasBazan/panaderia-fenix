import { router } from '@inertiajs/react';
import { useEffect, useMemo, useRef } from 'react';
import type { PublicProduct } from '@/components/ui/product-card';
import usePedido from '@/hooks/use-pedido';
import type { PedidoItem } from '@/lib/pedido';

type Resultado = {
    items: PedidoItem[];
    /** Líneas que se pueden pedir. */
    disponibles: PedidoItem[];
    /** Líneas que el servidor consultó y ya no vende. */
    dadosDeBaja: PedidoItem[];
};

/**
 * Firma de una lista de ids: únicos y ordenados. Deduplica porque un producto
 * con dos variantes son dos líneas pero un solo id, y el servidor confirma por
 * id único: sin deduplicar, la lista del navegador nunca coincidiría con la suya
 * y se repediría la página en un bucle.
 */
function ordenados(ids: number[]): string {
    return [...new Set(ids)].sort((a, b) => a - b).join(',');
}

/**
 * Cruza el pedido del navegador con los productos que el servidor confirmó.
 *
 * El pedido vive en localStorage y la validación en la URL (`?items=`), así que
 * las dos pueden no coincidir: se entra a `/carrito` a mano, se recarga sin
 * query, se vuelve con el botón de atrás. Cuando pasa, esto vuelve a pedir la
 * página con los ids correctos y mientras tanto no acusa a nadie de estar dado
 * de baja: sin haber preguntado, «no vino» no significa «no existe».
 */
export default function usePedidoRevalidado(
    url: string,
    productos: PublicProduct[],
    consultados: number[],
): Resultado {
    const { items } = usePedido();

    const idsPedido = useMemo(
        () => ordenados(items.map((item) => item.id)),
        [items],
    );
    const idsConsultados = useMemo(() => ordenados(consultados), [consultados]);
    const sincronizado = idsPedido === idsConsultados;

    // De qué lista se pidió confirmación: evita repetir el pedido en vuelo.
    const pedido = useRef<string | null>(null);

    useEffect(() => {
        if (sincronizado || pedido.current === idsPedido) {
            return;
        }

        pedido.current = idsPedido;

        router.get(
            url,
            { items: idsPedido },
            {
                replace: true,
                preserveState: true,
                preserveScroll: true,
                only: ['productos', 'consultados'],
            },
        );
    }, [sincronizado, idsPedido, url]);

    const vigentes = useMemo(
        () => new Set(productos.map((producto) => producto.id)),
        [productos],
    );

    return useMemo(() => {
        // Hasta que el servidor conteste por esta lista, todo se da por bueno.
        if (!sincronizado) {
            return { items, disponibles: items, dadosDeBaja: [] };
        }

        return {
            items,
            disponibles: items.filter((item) => vigentes.has(item.id)),
            dadosDeBaja: items.filter((item) => !vigentes.has(item.id)),
        };
    }, [items, sincronizado, vigentes]);
}
