import { Head, Link, usePage } from '@inertiajs/react';
import {
    FileText,
    LayoutDashboard,
    LogOut,
    Menu,
    Package,
    Tags,
    X,
} from 'lucide-react';
import { useState } from 'react';
import type { PropsWithChildren, ReactNode } from 'react';
import Logo from '@/components/brand/logo';
import useFlashToast from '@/hooks/use-flash-toast';
import { cn } from '@/lib/utils';
import type { PageProps } from '@/types';

const navegacion = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/cotizaciones', label: 'Cotizaciones', icon: FileText },
    { href: '/admin/productos', label: 'Productos', icon: Package },
    { href: '/admin/categorias', label: 'Categorías', icon: Tags },
];

type Props = PropsWithChildren<{
    /** Título de la pestaña y encabezado de la página. */
    title: string;
    /** Bajada opcional bajo el título. */
    description?: ReactNode;
    /** Rótulo corto sobre el título, para ubicar la sección. */
    eyebrow?: string;
    /** Acciones alineadas a la derecha del encabezado (botones «Nuevo», etc.). */
    actions?: ReactNode;
}>;

/**
 * Shell de la administración: barra superior con navegación, identidad del
 * usuario y salida. Barra arriba y no lateral: son cuatro secciones, y una
 * columna fija le comería ancho a las tablas, que es lo que acá se mira.
 */
export default function AdminLayout({
    title,
    description,
    eyebrow,
    actions,
    children,
}: Props) {
    useFlashToast();

    const { props, url } = usePage<PageProps>();
    const auth = props.auth;
    const [menuAbierto, setMenuAbierto] = useState(false);

    return (
        <div className="min-h-dvh bg-crema">
            <Head title={title} />

            <header className="sticky top-0 z-30 border-b border-borde bg-papel/92 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
                    <div className="flex items-center gap-8">
                        <Link
                            href="/admin"
                            className="text-carbon transition-opacity hover:opacity-80"
                            aria-label="Panadería Fénix, panel"
                        >
                            <Logo size={30} />
                        </Link>

                        <nav
                            className="hidden items-center gap-1 md:flex"
                            aria-label="Administración"
                        >
                            <NavLinks url={url} />
                        </nav>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="hidden max-w-40 truncate text-sm text-texto-medio lg:inline">
                            {auth.user?.name}
                        </span>
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="inline-flex items-center gap-2 rounded-full bg-papel px-3.5 py-2 text-sm text-texto-medio ring-1 ring-borde transition-[box-shadow,color] duration-200 ease-suave hover:text-bordo hover:ring-bordo/50 active:scale-[0.97]"
                        >
                            <LogOut className="size-4" aria-hidden="true" />
                            <span className="hidden sm:inline">Salir</span>
                        </Link>
                        <button
                            type="button"
                            onClick={() => setMenuAbierto((v) => !v)}
                            className="rounded-md bg-papel p-2 text-texto ring-1 ring-borde transition-[box-shadow] duration-200 hover:ring-dorado active:scale-95 md:hidden"
                            aria-label="Menú"
                            aria-expanded={menuAbierto}
                        >
                            {menuAbierto ? (
                                <X className="size-5" aria-hidden="true" />
                            ) : (
                                <Menu className="size-5" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </div>

                {menuAbierto && (
                    <nav
                        className="grid gap-1 border-t border-borde px-4 py-3 md:hidden"
                        aria-label="Administración"
                    >
                        <NavLinks
                            url={url}
                            mobile
                            onNavigate={() => setMenuAbierto(false)}
                        />
                    </nav>
                )}
            </header>

            <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        {eyebrow && (
                            <p className="font-mono text-[11px] tracking-[0.2em] text-texto-suave uppercase">
                                {eyebrow}
                            </p>
                        )}
                        <h1 className="mt-2 font-display text-4xl leading-tight text-texto">
                            {title}
                        </h1>
                        {description && (
                            <p className="mt-2 max-w-2xl leading-relaxed text-texto-medio">
                                {description}
                            </p>
                        )}
                    </div>
                    {actions && (
                        <div className="flex flex-wrap items-center gap-2">
                            {actions}
                        </div>
                    )}
                </div>

                <div className="mt-10">{children}</div>
            </main>
        </div>
    );
}

/** Los links de navegación, compartidos por la barra desktop y el menú mobile. */
function NavLinks({
    url,
    mobile = false,
    onNavigate,
}: {
    url: string;
    mobile?: boolean;
    onNavigate?: () => void;
}) {
    // `/admin` sólo está activo exacto; el resto, también en sus subrutas.
    const esActivo = (href: string): boolean =>
        href === '/admin' ? url === '/admin' : url.startsWith(href);

    return (
        <>
            {navegacion.map((item) => {
                const activo = esActivo(item.href);

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={onNavigate}
                        className={cn(
                            'relative flex items-center gap-2 text-sm font-medium transition-colors duration-200',
                            mobile
                                ? 'rounded-md px-3 py-2.5'
                                : 'rounded-md px-3 py-2',
                            // Filete dorado abajo: marca la sección sin encerrar
                            // el texto en una pastilla más.
                            !mobile &&
                                'after:absolute after:inset-x-3 after:bottom-0.5 after:h-px after:origin-left after:bg-dorado after:transition-transform after:duration-300 after:ease-suave',
                            activo
                                ? cn(
                                      'text-texto',
                                      mobile ? 'bg-crema' : 'after:scale-x-100',
                                  )
                                : cn(
                                      'text-texto-medio hover:text-texto',
                                      mobile
                                          ? 'hover:bg-crema'
                                          : 'after:scale-x-0 hover:after:scale-x-100',
                                  ),
                        )}
                        aria-current={activo ? 'page' : undefined}
                    >
                        <item.icon
                            className={cn(
                                'size-4 shrink-0',
                                activo
                                    ? 'text-dorado-hover'
                                    : 'text-texto-suave',
                            )}
                            aria-hidden="true"
                        />
                        {item.label}
                    </Link>
                );
            })}
        </>
    );
}
