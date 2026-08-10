import { Head, Link, usePage } from '@inertiajs/react';
import {
    FileText,
    LayoutDashboard,
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
    { href: '/admin', label: 'Panel', icon: LayoutDashboard },
    { href: '/admin/cotizaciones', label: 'Cotizaciones', icon: FileText },
    { href: '/admin/productos', label: 'Productos', icon: Package },
    { href: '/admin/categorias', label: 'Categorías', icon: Tags },
];

type Props = PropsWithChildren<{
    /** Título de la pestaña y encabezado de la página. */
    title: string;
    /** Bajada opcional bajo el título. */
    description?: ReactNode;
    /** Acciones alineadas a la derecha del encabezado (botones «Nuevo», etc.). */
    actions?: ReactNode;
}>;

/**
 * Shell de la administración: barra superior con navegación, identidad del
 * usuario y salida. El contenido va centrado a un ancho cómodo de lectura.
 */
export default function AdminLayout({
    title,
    description,
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

            <header className="border-b border-borde bg-papel">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
                    <div className="flex items-center gap-6">
                        <Link href="/admin" className="text-carbon">
                            <Logo size={28} />
                        </Link>

                        <nav
                            className="hidden items-center gap-1 md:flex"
                            aria-label="Administración"
                        >
                            <NavLinks url={url} />
                        </nav>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="hidden text-sm text-texto-medio sm:inline">
                            {auth.user?.name}
                        </span>
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="rounded-md border border-borde px-3 py-1.5 text-sm text-texto transition-colors hover:border-bordo hover:text-bordo"
                        >
                            Salir
                        </Link>
                        <button
                            type="button"
                            onClick={() => setMenuAbierto((v) => !v)}
                            className="rounded-md p-1.5 text-texto-medio transition-colors hover:bg-crema md:hidden"
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
                        className="border-t border-borde px-4 py-2 md:hidden"
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

            <main className="mx-auto max-w-6xl px-4 py-8">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="font-display text-3xl leading-tight text-texto">
                            {title}
                        </h1>
                        {description && (
                            <p className="mt-1 text-texto-medio">{description}</p>
                        )}
                    </div>
                    {actions && (
                        <div className="flex flex-wrap items-center gap-2">
                            {actions}
                        </div>
                    )}
                </div>

                <div className="mt-8">{children}</div>
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
            {navegacion.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                        'flex items-center gap-2 rounded-md text-sm font-medium transition-colors',
                        mobile ? 'px-3 py-2' : 'px-3 py-1.5',
                        esActivo(item.href)
                            ? 'bg-crema text-texto'
                            : 'text-texto-medio hover:bg-crema hover:text-texto',
                    )}
                    aria-current={esActivo(item.href) ? 'page' : undefined}
                >
                    <item.icon className="size-4 shrink-0" aria-hidden="true" />
                    {item.label}
                </Link>
            ))}
        </>
    );
}
