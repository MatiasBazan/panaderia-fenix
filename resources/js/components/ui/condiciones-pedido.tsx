import { usePage } from '@inertiajs/react';
import { CalendarClock, HandCoins } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Condiciones, PageProps } from '@/types/shared';

/** Las condiciones viajan compartidas: cualquier pantalla pública las tiene. */
export function useCondiciones(): Condiciones {
    return usePage<PageProps>().props.condiciones;
}

/**
 * Las dos condiciones en una frase corta, para meter en un párrafo existente
 * sin romperle el ritmo: "con 2 días de anticipación y una seña".
 */
export function condicionesEnFrase(condiciones: Condiciones): string {
    const dias =
        condiciones.dias_anticipacion === 1
            ? 'con un día de anticipación'
            : `con ${condiciones.dias_anticipacion} días de anticipación`;

    return condiciones.senia ? `${dias} y una seña` : dias;
}

type Props = {
    /**
     * `bloque` para las pantallas donde el visitante decide (carrito,
     * cotización); `linea` para los huecos angostos, como el panel del pedido.
     */
    variante?: 'bloque' | 'linea';
    className?: string;
};

/**
 * Cómo se toma un pedido: anticipación y seña.
 *
 * Sale de `settings` y no de un texto escrito a mano en cada pantalla, porque
 * si mañana la panadería pide tres días en vez de dos, cambiarlo en un lugar
 * tiene que alcanzar. Y porque decirlo distinto en el carrito que en la
 * cotización es la forma más rápida de que un cliente se sienta engañado.
 */
export default function CondicionesPedido({
    variante = 'bloque',
    className,
}: Props) {
    const condiciones = useCondiciones();

    const dias =
        condiciones.dias_anticipacion === 1
            ? 'Un día de anticipación'
            : `${condiciones.dias_anticipacion} días de anticipación`;

    if (variante === 'linea') {
        return (
            <p className={cn('text-xs text-texto-medio', className)}>
                Los pedidos se toman {condicionesEnFrase(condiciones)}.
            </p>
        );
    }

    return (
        <div
            className={cn(
                'filo rounded-lg bg-crema/60 px-4 py-4 ring-1 ring-borde',
                className,
            )}
        >
            <p className="font-mono text-[10px] tracking-[0.18em] text-texto-suave uppercase">
                Cómo tomamos el pedido
            </p>

            <ul className="mt-3 grid gap-3">
                <li className="flex items-start gap-3 text-sm leading-relaxed text-texto-medio">
                    <CalendarClock
                        className="mt-0.5 size-4 shrink-0 text-dorado"
                        aria-hidden="true"
                    />
                    <span>
                        <span className="font-medium text-texto">{dias}.</span>{' '}
                        Necesitamos ese tiempo para hornear tu pedido sin sacarle
                        lugar al mostrador.
                    </span>
                </li>

                {condiciones.senia && (
                    <li className="flex items-start gap-3 text-sm leading-relaxed text-texto-medio">
                        <HandCoins
                            className="mt-0.5 size-4 shrink-0 text-dorado"
                            aria-hidden="true"
                        />
                        <span>
                            <span className="font-medium text-texto">
                                Se confirma con una seña.
                            </span>{' '}
                            Te pasamos el monto junto con los precios, y ahí
                            coordinamos cómo abonarla.
                        </span>
                    </li>
                )}
            </ul>
        </div>
    );
}
