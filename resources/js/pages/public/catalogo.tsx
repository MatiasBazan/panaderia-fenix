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

            <div className="mx-auto max-w-6xl px-4 py-10">
                <h1 className="font-display text-4xl text-texto">
                    Nuestros productos
                </h1>
                <p className="mt-2 max-w-2xl text-texto-medio">
                    Armá tu pedido y pedinos los precios. Te los pasamos por
                    mail, según cantidad y frecuencia.
                </p>

                {/* Filtros */}
                <div className="mt-8 grid gap-4">
                    <div className="relative max-w-sm">
                        <Search
                            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-texto-suave"
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
                            className="h-10 w-full rounded-md border border-borde bg-papel pr-3 pl-9 text-sm text-texto placeholder:text-texto-suave focus:border-dorado focus:outline-none"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Link
                            href="/productos"
                            preserveScroll
                            only={SOLO_GRILLA.only}
                            className={cn(
                                'rounded-md border px-3 py-1.5 text-sm transition-colors',
                                filtros.categoria === null
                                    ? 'border-dorado bg-dorado/15 font-medium text-texto'
                                    : 'border-borde bg-papel text-texto-medio hover:border-dorado',
                            )}
                        >
                            Todo
                        </Link>
                        {categorias.map((categoria) => (
                            <Link
                                key={categoria.slug}
                                href={`/productos?categoria=${categoria.slug}`}
                                preserveScroll
                                only={SOLO_GRILLA.only}
                                className={cn(
                                    'rounded-md border px-3 py-1.5 text-sm transition-colors',
                                    filtros.categoria === categoria.slug
                                        ? 'border-dorado bg-dorado/15 font-medium text-texto'
                                        : 'border-borde bg-papel text-texto-medio hover:border-dorado',
                                )}
                            >
                                {categoria.nombre}
                                <span className="ml-1.5 font-mono text-xs text-texto-suave">
                                    {categoria.productos_count}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Grilla */}
                {productos.data.length === 0 ? (
                    <EmptyState
                        className="mt-10"
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
                    <div className="mt-8 grid gap-6">
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
