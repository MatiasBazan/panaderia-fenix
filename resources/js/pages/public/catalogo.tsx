import { Head, Link, router } from '@inertiajs/react';
import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button, EmptyState, Pagination, ProductCard } from '@/components/ui';
import type { PublicProduct } from '@/components/ui';
import PublicLayout from '@/layouts/public-layout';
import { cn } from '@/lib/utils';
import type { Paginated } from '@/types';

type Categoria = {
    nombre: string;
    slug: string;
    productos_count: number;
};

type Props = {
    productos: Paginated<PublicProduct>;
    categorias: Categoria[];
    filtros: { categoria: string | null; q: string | null };
};

/** Solo se recargan la grilla y los filtros; la barra de categorías queda cacheada. */
const SOLO_GRILLA = { only: ['productos', 'filtros'] };

const chip =
    'rounded-full px-3.5 py-1.5 text-sm ring-1 transition-[background-color,color,box-shadow] duration-200 ease-suave';

export default function Catalogo({ productos, categorias, filtros }: Props) {
    const [busqueda, setBusqueda] = useState(filtros.q ?? '');

    // Busca sola mientras se escribe, sin perder el foco del input.
    useEffect(() => {
        const actual = filtros.q ?? '';

        if (busqueda === actual) {
            return;
        }

        const timer = window.setTimeout(() => {
            router.get(
                '/productos',
                {
                    categoria: filtros.categoria ?? undefined,
                    q: busqueda || undefined,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                    ...SOLO_GRILLA,
                },
            );
        }, 350);

        return () => window.clearTimeout(timer);
    }, [busqueda, filtros.q, filtros.categoria]);

    const hayFiltros = Boolean(filtros.categoria || filtros.q);

    return (
        <PublicLayout>
            <Head title="Productos" />

            {/* Encabezado editorial sobre el halo del horno. */}
            <div className="grano relative overflow-hidden border-b border-borde halo-horno">
                <div className="relative z-1 mx-auto max-w-6xl px-4 pt-14 pb-12 sm:px-6 sm:pt-20">
                    <p className="font-mono text-[11px] tracking-[0.2em] text-bordo uppercase">
                        Catálogo
                    </p>
                    <h1 className="mt-4 max-w-2xl font-display text-titular text-texto">
                        Nuestros productos
                    </h1>
                    <p className="mt-5 max-w-xl text-lg leading-relaxed text-texto-medio">
                        Armá tu pedido y pedinos los precios. Te los pasamos por
                        mail, según cantidad y frecuencia.
                    </p>
                </div>
            </div>

            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                {/* Filtros: quedan a mano mientras se recorre la grilla. */}
                <div className="sticky top-[4.25rem] z-20 -mx-4 border-b border-borde bg-crema/88 px-4 py-4 backdrop-blur-md sm:-mx-6 sm:px-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="relative w-full max-w-sm">
                            <Search
                                className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-texto-suave"
                                aria-hidden="true"
                            />
                            <input
                                type="search"
                                value={busqueda}
                                onChange={(event) =>
                                    setBusqueda(event.target.value)
                                }
                                placeholder="Buscar pan, facturas, tortas…"
                                aria-label="Buscar productos"
                                className="h-11 w-full rounded-full bg-papel pr-4 pl-10 text-sm text-texto ring-1 ring-borde transition-shadow duration-200 placeholder:text-texto-suave focus:ring-dorado focus:outline-none"
                            />
                        </div>

                        <div className="-mx-1 flex flex-nowrap items-center gap-2 overflow-x-auto px-1 pb-1 lg:flex-wrap lg:overflow-visible lg:pb-0">
                            <Link
                                href="/productos"
                                preserveScroll
                                only={SOLO_GRILLA.only}
                                aria-current={
                                    filtros.categoria === null
                                        ? 'true'
                                        : undefined
                                }
                                className={cn(
                                    chip,
                                    'shrink-0',
                                    filtros.categoria === null
                                        ? 'bg-carbon text-crema ring-carbon'
                                        : 'bg-papel text-texto-medio ring-borde hover:text-texto hover:ring-dorado',
                                )}
                            >
                                Todo
                            </Link>
                            {categorias.map((categoria) => {
                                const activa =
                                    filtros.categoria === categoria.slug;

                                return (
                                    <Link
                                        key={categoria.slug}
                                        href={`/productos?categoria=${categoria.slug}`}
                                        preserveScroll
                                        only={SOLO_GRILLA.only}
                                        aria-current={
                                            activa ? 'true' : undefined
                                        }
                                        className={cn(
                                            chip,
                                            'shrink-0',
                                            activa
                                                ? 'bg-carbon text-crema ring-carbon'
                                                : 'bg-papel text-texto-medio ring-borde hover:text-texto hover:ring-dorado',
                                        )}
                                    >
                                        {categoria.nombre}
                                        <span
                                            className={cn(
                                                'ml-2 font-mono text-xs',
                                                activa
                                                    ? 'text-crema/70'
                                                    : 'text-texto-suave',
                                            )}
                                        >
                                            {categoria.productos_count}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Grilla */}
                {productos.data.length === 0 ? (
                    <EmptyState
                        className="my-16"
                        title="No encontramos nada con ese filtro"
                        description={
                            hayFiltros
                                ? 'Probá con otra categoría o cambiá las palabras de la búsqueda.'
                                : 'Todavía no hay productos publicados en el catálogo.'
                        }
                        icon={<Search className="size-8" />}
                        action={
                            hayFiltros ? (
                                <Link href="/productos">
                                    <Button
                                        variant="secondary"
                                        icon={
                                            <X
                                                className="size-4"
                                                aria-hidden="true"
                                            />
                                        }
                                    >
                                        Limpiar filtros
                                    </Button>
                                </Link>
                            ) : undefined
                        }
                    />
                ) : (
                    <div className="grid gap-8 py-10 sm:py-12">
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {productos.data.map((producto) => (
                                <ProductCard
                                    key={producto.id}
                                    product={producto}
                                />
                            ))}
                        </div>

                        <Pagination meta={productos} />
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
