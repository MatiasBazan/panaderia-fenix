import { Head, Link, router } from '@inertiajs/react';
import { ShoppingBasket, Trash2, TriangleAlert } from 'lucide-react';
import {
    Button,
    EmptyState,
    Pasos,
    QuantityInput,
    Thumb,
    UnitBadge,
} from '@/components/ui';
import type { PublicProduct } from '@/components/ui';
import usePedido from '@/hooks/use-pedido';
import usePedidoRevalidado from '@/hooks/use-pedido-revalidado';
import PublicLayout from '@/layouts/public-layout';
import { PASOS_PEDIDO, claveLinea, resumenPorUnidad } from '@/lib/pedido';

type Props = {
    /** Productos todavía activos, entre los que el visitante venía trayendo. */
    productos: PublicProduct[];
    /** Ids por los que el servidor efectivamente preguntó. */
    consultados: number[];
};

/**
 * Paso 1: revisar el pedido con espacio, antes de pedir un solo dato personal.
 * El panel lateral sirve para la mirada rápida; acá se corrigen cantidades y
 * se escriben las notas sin tener un formulario de contacto compitiendo abajo.
 */
export default function Carrito({ productos, consultados }: Props) {
    const { actualizar, quitar, vaciar } = usePedido();
    const { items, disponibles, dadosDeBaja } = usePedidoRevalidado(
        '/carrito',
        productos,
        consultados,
    );

    // Los ids viajan en la URL para que el paso 2 pueda revalidarlos contra la
    // base. Van todos, incluso los que acá ya salieron dados de baja: el paso 2
    // compara contra el pedido entero del navegador, así que mandar sólo los
    // vigentes lo dejaría desincronizado y pidiendo la página de nuevo al llegar.
    const continuar = () => {
        router.get('/cotizacion', {
            items: [...new Set(items.map((item) => item.id))].join(','),
        });
    };

    if (items.length === 0) {
        return (
            <PublicLayout sinPedido>
                <Head title="Tu pedido" />
                <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
                    <EmptyState
                        title="Tu pedido está vacío"
                        description="Recorré el catálogo y agregá lo que quieras. Después dejás tus datos y te pasamos los precios."
                        icon={<ShoppingBasket className="size-8" />}
                        action={
                            <Link href="/productos">
                                <Button>Ver el catálogo</Button>
                            </Link>
                        }
                    />
                </div>
            </PublicLayout>
        );
    }

    return (
        <PublicLayout sinPedido>
            <Head title="Tu pedido" />

            <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
                <Pasos pasos={PASOS_PEDIDO} actual={0} />

                <h1 className="mt-8 font-display text-seccion text-texto">
                    Tu pedido
                </h1>
                <p className="mt-3 max-w-lg leading-relaxed text-texto-medio">
                    Revisá cantidades y agregá una nota si hace falta. Todavía
                    no estás enviando nada.
                </p>

                {dadosDeBaja.length > 0 && (
                    <div className="mt-8 flex items-start gap-3 rounded-lg bg-alerta/8 px-4 py-3.5 ring-1 ring-alerta/40">
                        <TriangleAlert
                            className="mt-0.5 size-4 shrink-0 text-alerta"
                            aria-hidden="true"
                        />
                        <div className="text-sm">
                            <p className="font-medium text-texto">
                                {dadosDeBaja.length === 1
                                    ? 'Un producto de tu pedido ya no está'
                                    : `${dadosDeBaja.length} productos de tu pedido ya no están`}
                            </p>
                            <p className="mt-0.5 text-texto-medio">
                                Dejamos de vender{' '}
                                {dadosDeBaja
                                    .map((item) => item.nombre)
                                    .join(', ')}
                                . No {dadosDeBaja.length === 1 ? 'va' : 'van'} a
                                viajar con el pedido.
                            </p>
                            <button
                                type="button"
                                onClick={() =>
                                    dadosDeBaja.forEach((item) =>
                                        quitar(
                                            claveLinea(item.id, item.variante),
                                        ),
                                    )
                                }
                                className="mt-1.5 text-texto underline underline-offset-4 hover:text-bordo"
                            >
                                Entendido, quitarlos
                            </button>
                        </div>
                    </div>
                )}

                <ul className="mt-8 grid gap-3">
                    {disponibles.map((item) => (
                        <li
                            key={claveLinea(item.id, item.variante)}
                            className="rounded-xl bg-papel p-4 shadow-xs ring-1 ring-borde transition-shadow duration-300 ease-suave hover:shadow-sm"
                        >
                            <div className="flex gap-4">
                                <Link
                                    href={`/productos/${item.slug}`}
                                    aria-label={`Ver ${item.nombre}`}
                                >
                                    <Thumb
                                        src={item.imagen ?? null}
                                        className="size-16"
                                    />
                                </Link>

                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <Link
                                                href={`/productos/${item.slug}`}
                                                className="font-display text-lg leading-tight text-texto transition-colors hover:text-bordo"
                                            >
                                                {item.nombre}
                                            </Link>
                                            {item.variante && (
                                                <p className="mt-0.5 text-sm text-texto-medio">
                                                    {item.variante}
                                                </p>
                                            )}
                                            <UnitBadge
                                                unidad={item.unidad}
                                                className="mt-1.5 block w-fit"
                                            />
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <QuantityInput
                                                value={item.cantidad}
                                                onChange={(cantidad) =>
                                                    actualizar(
                                                        claveLinea(
                                                            item.id,
                                                            item.variante,
                                                        ),
                                                        { cantidad },
                                                    )
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
                                            <Button
                                                variant="quiet"
                                                size="sm"
                                                onClick={() =>
                                                    quitar(
                                                        claveLinea(
                                                            item.id,
                                                            item.variante,
                                                        ),
                                                    )
                                                }
                                                aria-label={`Quitar ${item.nombre}`}
                                            >
                                                <Trash2
                                                    className="size-4"
                                                    aria-hidden="true"
                                                />
                                            </Button>
                                        </div>
                                    </div>

                                    <input
                                        type="text"
                                        value={item.nota ?? ''}
                                        onChange={(event) =>
                                            actualizar(
                                                claveLinea(
                                                    item.id,
                                                    item.variante,
                                                ),
                                                { nota: event.target.value },
                                            )
                                        }
                                        placeholder="Nota para este producto (opcional)"
                                        aria-label={`Nota para ${item.nombre}`}
                                        maxLength={180}
                                        className="mt-3 h-9 w-full rounded-md bg-crema px-3 text-sm text-texto ring-1 ring-borde placeholder:text-texto-suave focus:ring-dorado focus:outline-none"
                                    />
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>

                <div className="mt-8 flex flex-wrap items-baseline justify-between gap-3 border-t border-borde pt-5">
                    <p className="text-sm text-texto">
                        <span className="font-mono font-medium">
                            {disponibles.length}
                        </span>{' '}
                        {disponibles.length === 1 ? 'producto' : 'productos'}
                    </p>
                    <p className="font-mono text-sm text-texto-medio">
                        {resumenPorUnidad(disponibles)}
                    </p>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                    <Button
                        size="lg"
                        onClick={continuar}
                        disabled={disponibles.length === 0}
                    >
                        Continuar
                    </Button>
                    <Link href="/productos">
                        <Button variant="secondary" size="lg">
                            Seguir mirando
                        </Button>
                    </Link>
                    <button
                        type="button"
                        onClick={vaciar}
                        className="text-sm text-texto-suave underline underline-offset-4 hover:text-error"
                    >
                        Vaciar el pedido
                    </button>
                </div>

                <p className="mt-8 max-w-lg border-l-2 border-dorado py-1 pl-5 text-sm leading-relaxed text-texto-medio">
                    En el próximo paso te pedimos nombre y teléfono para poder
                    responderte con los precios.
                </p>
            </div>
        </PublicLayout>
    );
}
