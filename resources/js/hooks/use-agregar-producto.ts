import { useCallback } from 'react';
import type { PublicProduct } from '@/components/ui/product-card';
import { useToast } from '@/components/ui/toast';
import usePedido, {
    hayLugarParaElPanel,
    usePanelPedido,
} from '@/hooks/use-pedido';
import { cantidadConUnidad } from '@/lib/pedido';

/**
 * Agregar un producto al pedido es lo mismo en la landing, el catálogo y el
 * detalle: sumar la línea y dejar ver cómo queda el pedido.
 *
 * En pantalla grande abre el panel y lo deja abierto — se ve entrar cada
 * producto sin salir del catálogo. En pantalla chica el panel taparía todo, así
 * que ahí el aviso lo da el toast y el globo del botón.
 */
export default function useAgregarProducto() {
    const { agregar, cantidadDe } = usePedido();
    const { abrir } = usePanelPedido();
    const { push } = useToast();

    return useCallback(
        (product: PublicProduct, cantidad: number) => {
            agregar(
                {
                    id: product.id,
                    slug: product.slug,
                    nombre: product.nombre,
                    unidad: product.unidad,
                    imagen: product.imagen_thumb ?? product.imagen ?? null,
                },
                cantidad,
            );

            if (hayLugarParaElPanel()) {
                abrir();

                return;
            }

            const total = cantidadDe(product.id) + cantidad;

            push(
                'exito',
                `${product.nombre}: llevás ${cantidadConUnidad(total, product.unidad)}.`,
            );
        },
        [agregar, abrir, cantidadDe, push],
    );
}
