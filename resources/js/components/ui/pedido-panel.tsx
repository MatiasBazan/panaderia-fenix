import { Link } from '@inertiajs/react';
import { ShoppingBasket, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import usePedido, { usePanelPedido } from '@/hooks/use-pedido';
import { claveLinea } from '@/lib/pedido';
import { cn } from '@/lib/utils';
import Button from './button';
import QuantityInput from './quantity-input';
import Thumb from './thumb';
import { UnitBadge } from './badge';

/** Cuánto dura el resaltado de la línea que acaba de entrar. */
const DESTACADO_MS = 1400;

/** Id de DOM para una clave de línea: la clave lleva espacios y no vale como id. */
function idLinea(clave: string): string {
    return `pedido-linea-${encodeURIComponent(clave)}`;
}

/**
 * Panel con el pedido armado, al costado del catálogo.
 *
 * No es un modal: la página de atrás sigue viva, así que se queda abierto
 * mientras se agregan productos y cada uno aparece en la lista en el momento.
 * Por eso tampoco atrapa el foco — atraparlo dejaría el catálogo inalcanzable,
 * que es justo lo contrario de lo que hace falta acá.
 */
export default function PedidoPanel() {
    const { abierto, cerrar } = usePanelPedido();
    const { items, lineas, resumen, actualizar, quitar, vaciar } = usePedido();

    // Qué línea acaba de crecer, para que se vea entrar y no haya que buscarla.
    // Se sigue por clave de línea: dos variantes del mismo producto son distintas.
    const [destacado, setDestacado] = useState<string | null>(null);
    const cantidades = useRef(new Map<string, number>());
    const sembrado = useRef(false);

    useEffect(() => {
        const actuales = new Map(
            items.map((item) => [
                claveLinea(item.id, item.variante),
                item.cantidad,
            ]),
        );

        // El primer render no destaca nada: la lista ya venía armada.
        if (! sembrado.current) {
            sembrado.current = true;
            cantidades.current = actuales;

            return;
        }

        let crecio: string | null = null;

        actuales.forEach((cantidad, clave) => {
            const antes = cantidades.current.get(clave);

            if (antes === undefined || cantidad > antes) {
                crecio = clave;
            }
        });

        cantidades.current = actuales;

        if (crecio === null) {
            return;
        }

        setDestacado(crecio);
        const timer = window.setTimeout(() => setDestacado(null), DESTACADO_MS);

        return () => window.clearTimeout(timer);
    }, [items]);

    // La línea destacada se trae a la vista: el panel puede estar scrolleado.
    useEffect(() => {
        if (destacado === null) {
            return;
        }

        document
            .getElementById(idLinea(destacado))
            ?.scrollIntoView({ block: 'nearest' });
    }, [destacado]);

    // Escape cierra, como en cualquier panel, aunque no sea modal.
    useEffect(() => {
        if (! abierto) {
            return;
        }

        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                cerrar();
            }
        };

        window.addEventListener('keydown', onKey);

        return () => window.removeEventListener('keydown', onKey);
    }, [abierto, cerrar]);

    if (! abierto) {
        return null;
    }

    return (
        <>
            {/* Sólo en pantallas chicas, donde el panel sí tapa el catálogo. */}
            <button
                type="button"
                onClick={cerrar}
                aria-label="Cerrar el pedido"
                tabIndex={-1}
                className="fixed inset-0 z-30 cursor-default bg-carbon/45 backdrop-blur-[2px] lg:hidden"
            />

            <aside
                aria-label="Tu pedido"
                className={cn(
                    'fixed top-0 right-0 bottom-0 z-40 flex w-full max-w-sm flex-col',
                    'animate-deslizar border-l border-borde bg-papel shadow-alzado',
                    'lg:w-[22rem] lg:max-w-none lg:shadow-none',
                )}
            >
                <div className="flex items-center justify-between gap-4 border-b border-borde px-5 py-4.5">
                    <h2 className="font-display text-2xl leading-tight text-texto">
                        Tu pedido
                    </h2>
                    <button
                        type="button"
                        onClick={cerrar}
                        aria-label="Cerrar el pedido"
                        className="-mr-1 rounded-md p-1.5 text-texto-medio transition-colors hover:bg-crema hover:text-texto"
                    >
                        <X className="size-4" aria-hidden="true" />
                    </button>
                </div>

                {items.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
                        <ShoppingBasket
                            className="size-8 text-texto-suave"
                            aria-hidden="true"
                        />
                        <p className="font-display text-xl text-texto">
                            Todavía no agregaste nada
                        </p>
                        <p className="text-sm text-texto-medio">
                            Lo que vayas agregando desde el catálogo aparece
                            acá, sin que tengas que salir de la página.
                        </p>
                        <Link href="/productos" className="mt-1">
                            <Button variant="secondary">Ver el catálogo</Button>
                        </Link>
                    </div>
                ) : (
                    <>
                        <ul
                            className="flex-1 overflow-y-auto px-5 py-4"
                            aria-live="polite"
                        >
                            {items.map((item) => {
                                const clave = claveLinea(item.id, item.variante);

                                return (
                                    <li
                                        key={clave}
                                        id={idLinea(clave)}
                                        className={cn(
                                            '-mx-2 flex gap-3 rounded-md border-b border-borde px-2 py-3 last:border-b-0',
                                            destacado === clave &&
                                                'animate-destacar',
                                        )}
                                    >
                                        <Link
                                            href={`/productos/${item.slug}`}
                                            aria-label={`Ver ${item.nombre}`}
                                        >
                                            <Thumb
                                                src={item.imagen ?? null}
                                                className="size-14"
                                            />
                                        </Link>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <Link
                                                        href={`/productos/${item.slug}`}
                                                        className="text-sm leading-snug font-medium text-texto transition-colors hover:text-bordo"
                                                    >
                                                        {item.nombre}
                                                    </Link>
                                                    {item.variante && (
                                                        <p className="text-xs text-texto-medio">
                                                            {item.variante}
                                                        </p>
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        quitar(clave)
                                                    }
                                                    aria-label={`Quitar ${item.nombre} del pedido`}
                                                    className="-mt-0.5 rounded-md p-1 text-texto-suave transition-colors hover:bg-crema hover:text-error"
                                                >
                                                    <Trash2
                                                        className="size-4"
                                                        aria-hidden="true"
                                                    />
                                                </button>
                                            </div>

                                            <div className="mt-2 flex items-center gap-2">
                                                <QuantityInput
                                                    value={item.cantidad}
                                                    onChange={(cantidad) =>
                                                        actualizar(clave, {
                                                            cantidad,
                                                        })
                                                    }
                                                    unidad={item.unidad}
                                                    min={
                                                        item.unidad === 'kg'
                                                            ? 0.5
                                                            : 1
                                                    }
                                                    size="sm"
                                                    label={`Cantidad de ${item.nombre}`}
                                                />
                                                <UnitBadge
                                                    unidad={item.unidad}
                                                />
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>

                        <div className="filo border-t border-borde bg-crema/60 px-5 py-5">
                            <p className="flex items-baseline justify-between gap-3 text-sm">
                                <span className="text-texto">
                                    <span className="font-mono font-medium">
                                        {lineas}
                                    </span>{' '}
                                    {lineas === 1 ? 'producto' : 'productos'}
                                </span>
                                <span className="font-mono text-xs text-texto-medio">
                                    {resumen}
                                </span>
                            </p>

                            <p className="mt-2 text-xs text-texto-medio">
                                No mostramos precios en el sitio: te los pasamos
                                según cantidad y frecuencia.
                            </p>

                            {/* Los ids viajan en la URL: el servidor confirma
                                cuáles siguen a la venta antes de dibujar nada. */}
                            <Link
                                href={`/carrito?items=${[...new Set(items.map((item) => item.id))].join(',')}`}
                                className="mt-3 block"
                            >
                                <Button block>Pedir precios</Button>
                            </Link>

                            <div className="mt-2 flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={cerrar}
                                    className="text-sm text-texto-medio underline underline-offset-4 hover:text-bordo"
                                >
                                    Seguir mirando
                                </button>
                                <button
                                    type="button"
                                    onClick={vaciar}
                                    className="text-sm text-texto-suave underline underline-offset-4 hover:text-error"
                                >
                                    Vaciar
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </aside>
        </>
    );
}
