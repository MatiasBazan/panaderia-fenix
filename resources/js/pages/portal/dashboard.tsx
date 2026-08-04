import { Head, Link, usePage } from '@inertiajs/react';
import Logo from '@/components/brand/logo';
import type { PageProps } from '@/types';

/** Provisorio: el dashboard real del portal llega en la fase 5. */
export default function PortalDashboard() {
    const { auth } = usePage<PageProps>().props;

    return (
        <>
            <Head title="Portal" />

            <div className="min-h-dvh bg-crema">
                <header className="border-b border-borde bg-papel">
                    <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
                        <Logo size={28} className="text-carbon" />
                        <div className="flex items-center gap-4 text-sm">
                            <span className="text-texto-medio">
                                {auth.user?.name}
                            </span>
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="rounded-md border border-borde px-3 py-1.5 text-texto transition-colors hover:border-bordo hover:text-bordo"
                            >
                                Salir
                            </Link>
                        </div>
                    </div>
                </header>

                <main className="mx-auto max-w-5xl px-4 py-10">
                    <h1 className="font-display text-3xl text-texto">
                        Portal de comercios
                    </h1>
                    <p className="mt-2 text-texto-medio">
                        Catálogo con tus precios, pedidos y cuenta corriente.
                    </p>

                    <p className="mt-8 inline-block rounded-md border border-borde bg-papel px-4 py-2 font-mono text-xs text-texto-suave">
                        FASE 1 · base técnica · portal en construcción
                    </p>
                </main>
            </div>
        </>
    );
}
