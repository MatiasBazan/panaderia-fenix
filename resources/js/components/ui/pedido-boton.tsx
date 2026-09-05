import { ShoppingBasket } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import usePedido, { usePanelPedido } from '@/hooks/use-pedido';
import { cn } from '@/lib/utils';

/**
 * Acceso al pedido desde la barra superior. Está siempre, con lista o sin ella:
 * si sólo apareciera al tener productos, el visitante no sabría dónde mirar.
 * El globo late cuando el número cambia, para que se note que algo entró.
 */
export default function PedidoBoton({ className }: { className?: string }) {
    const { lineas } = usePedido();
    const { abierto, alternar } = usePanelPedido();
    const [late, setLate] = useState(false);
    const anterior = useRef(lineas);

    useEffect(() => {
        if (lineas === anterior.current) {
            return;
        }

        anterior.current = lineas;

        if (lineas === 0) {
            return;
        }

        setLate(true);
        const timer = window.setTimeout(() => setLate(false), 320);

        return () => window.clearTimeout(timer);
    }, [lineas]);

    return (
        <button
            type="button"
            onClick={alternar}
            aria-expanded={abierto}
            aria-label={
                lineas === 0
                    ? 'Tu pedido está vacío'
                    : `Tu pedido: ${lineas} ${lineas === 1 ? 'producto' : 'productos'}`
            }
            className={cn(
                'relative inline-flex items-center gap-2 rounded-full bg-papel px-4 py-2.5 ring-1',
                'text-sm text-texto shadow-xs transition-[box-shadow,background-color] duration-200 ease-suave',
                'hover:shadow-sm hover:ring-dorado active:scale-[0.97]',
                abierto ? 'ring-dorado' : 'ring-borde',
                className,
            )}
        >
            <ShoppingBasket className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Tu pedido</span>

            {lineas > 0 && (
                <span
                    aria-hidden="true"
                    className={cn(
                        'absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full',
                        'bg-bordo font-mono text-[11px] leading-none font-medium text-crema',
                        late && 'animate-latido',
                    )}
                >
                    {lineas}
                </span>
            )}
        </button>
    );
}
