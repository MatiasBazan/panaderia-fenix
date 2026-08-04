import { Head, Link, usePage } from '@inertiajs/react';
import Logo from '@/components/brand/logo';
import type { PageProps } from '@/types';

/** Provisorio: el dashboard real de administración llega en la fase 4. */
export default function AdminDashboard() {
    const { auth } = usePage<PageProps>().props;

    return (
        <>
            <Head title="Administración" />

            <div className="min-h-dvh bg-papel">
                <header className="border-b border-borde">
                    <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
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

                <main className="mx-auto max-w-6xl px-4 py-8">
                    <h1 className="font-display text-3xl text-texto">
                        Administración
                    </h1>
                    <p className="mt-2 text-texto-medio">
                        Productos, cotizaciones, pedidos, comercios y cuentas
                        corrientes.
                    </p>

                    <p className="mt-8 inline-block rounded-md border border-borde bg-crema px-4 py-2 font-mono text-xs text-texto-suave">
                        FASE 1 · base técnica · admin en construcción
                    </p>
                </main>
            </div>
        </>
    );
}
