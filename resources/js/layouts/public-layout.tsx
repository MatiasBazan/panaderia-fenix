import { Link } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';
import Logo from '@/components/brand/logo';
import { PedidoBoton, PedidoPanel } from '@/components/ui';
import { useCurrentUrl } from '@/hooks/use-current-url';
import useFlashToast from '@/hooks/use-flash-toast';
import { usePanelPedido } from '@/hooks/use-pedido';
import { cn } from '@/lib/utils';

const navegacion = [
    { href: '/productos', label: 'Productos' },
    { href: '/#sobre', label: 'La panadería' },
    { href: '/#ubicacion', label: 'Dónde estamos' },
];

type Props = PropsWithChildren<{
    /** Oculta el acceso al pedido, en las pantallas que ya son el pedido. */
    sinPedido?: boolean;
}>;

export default function PublicLayout({ children, sinPedido = false }: Props) {
    useFlashToast();

    const { abierto: panelAbierto } = usePanelPedido();
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const [scrolled, setScrolled] = useState(false);
    const [menuAbierto, setMenuAbierto] = useState(false);

    // La barra superior recién toma borde cuando el contenido pasa por debajo.
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Con el menú desplegado el fondo no se mueve: se lee una cosa por vez.
    useEffect(() => {
        document.body.style.overflow = menuAbierto ? 'hidden' : '';

        return () => {
            document.body.style.overflow = '';
        };
    }, [menuAbierto]);

    return (
        <div
            className={cn(
                'flex min-h-dvh flex-col bg-crema transition-[padding] duration-300 ease-suave',
                // El panel se queda al costado: el contenido le hace lugar en vez
                // de quedar tapado, así se puede seguir agregando con él abierto.
                !sinPedido && panelAbierto && 'lg:pr-[22rem]',
            )}
        >
            <a
                href="#contenido"
                className="sr-only rounded-md bg-papel px-4 py-2 text-sm font-medium text-texto ring-1 ring-dorado focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50"
            >
                Saltar al contenido
            </a>

            <header
                className={cn(
                    'sticky top-0 z-30 transition-[background-color,box-shadow] duration-300 ease-suave',
                    scrolled
                        ? 'bg-crema/88 shadow-[0_1px_0_var(--color-borde),0_10px_28px_-24px_rgba(58,44,26,0.5)] backdrop-blur-md'
                        : 'bg-crema/60 backdrop-blur-sm',
                )}
            >
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
                    <Link
                        href="/"
                        className="text-carbon transition-opacity hover:opacity-80"
                        aria-label="Panadería Fénix, inicio"
                    >
                        <Logo size={34} />
                    </Link>

                    <nav
                        className="hidden items-center gap-1 md:flex"
                        aria-label="Principal"
                    >
                        {navegacion.map((item) => {
                            const activo =
                                !item.href.includes('#') &&
                                isCurrentOrParentUrl(item.href);

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    aria-current={activo ? 'page' : undefined}
                                    className={cn(
                                        'relative rounded-md px-3 py-2 text-sm transition-colors duration-200',
                                        // Subrayado corto en dorado: dice dónde
                                        // estamos sin encerrar el texto en una caja.
                                        'after:absolute after:inset-x-3 after:bottom-0.5 after:h-px after:origin-left after:bg-dorado after:transition-transform after:duration-300 after:ease-suave',
                                        activo
                                            ? 'text-texto after:scale-x-100'
                                            : 'text-texto-medio after:scale-x-0 hover:text-texto hover:after:scale-x-100',
                                    )}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="flex items-center gap-2">
                        {!sinPedido && <PedidoBoton />}

                        <button
                            type="button"
                            onClick={() =>
                                setMenuAbierto((abierto) => !abierto)
                            }
                            aria-expanded={menuAbierto}
                            aria-controls="menu-movil"
                            aria-label={
                                menuAbierto ? 'Cerrar menú' : 'Abrir menú'
                            }
                            className="rounded-md bg-papel p-2.5 text-texto ring-1 ring-borde transition-[box-shadow] duration-200 hover:ring-dorado active:scale-95 md:hidden"
                        >
                            {menuAbierto ? (
                                <X className="size-4" aria-hidden="true" />
                            ) : (
                                <Menu className="size-4" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* Menú chico: cubre la pantalla, para que el pulgar no falle. */}
            {menuAbierto && (
                <div
                    id="menu-movil"
                    className="fixed inset-0 z-40 bg-crema/95 backdrop-blur-lg md:hidden"
                >
                    <div className="flex items-center justify-between px-4 py-3.5">
                        <Logo size={34} className="text-carbon" />
                        <button
                            type="button"
                            onClick={() => setMenuAbierto(false)}
                            aria-label="Cerrar menú"
                            className="rounded-md bg-papel p-2.5 text-texto ring-1 ring-borde active:scale-95"
                        >
                            <X className="size-4" aria-hidden="true" />
                        </button>
                    </div>

                    <nav className="px-6 pt-6" aria-label="Principal">
                        <ul className="grid gap-1">
                            {navegacion.map((item) => (
                                <li
                                    key={item.href}
                                    className="border-b border-borde last:border-0"
                                >
                                    <Link
                                        href={item.href}
                                        onClick={() => setMenuAbierto(false)}
                                        className="block py-4 font-display text-3xl text-texto transition-colors hover:text-bordo"
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            )}

            <main id="contenido" className="flex-1">
                {children}
            </main>

            <footer className="grano relative border-t border-borde bg-papel">
                <div className="relative z-1 mx-auto max-w-6xl px-4 pt-14 pb-10 sm:px-6">
                    <div className="grid gap-10 sm:grid-cols-[1.4fr_1fr_1fr]">
                        <div>
                            <Logo size={32} className="text-carbon" />
                            <p className="mt-4 max-w-xs leading-relaxed text-texto-medio">
                                Panadería de barrio desde 1987. Horneamos todos
                                los días, incluso los domingos.
                            </p>
                        </div>

                        <nav
                            aria-label="Panadería"
                            className="grid content-start gap-3"
                        >
                            <p className="font-mono text-[10px] tracking-[0.18em] text-texto-suave uppercase">
                                Panadería
                            </p>
                            <Link
                                href="/productos"
                                className="text-sm text-texto-medio transition-colors hover:text-bordo"
                            >
                                Ver el catálogo
                            </Link>
                            <Link
                                href="/#sobre"
                                className="text-sm text-texto-medio transition-colors hover:text-bordo"
                            >
                                Nuestra historia
                            </Link>
                            <Link
                                href="/#ubicacion"
                                className="text-sm text-texto-medio transition-colors hover:text-bordo"
                            >
                                Dónde estamos
                            </Link>
                        </nav>

                        <nav
                            aria-label="Accesos"
                            className="grid content-start gap-3"
                        >
                            <p className="font-mono text-[10px] tracking-[0.18em] text-texto-suave uppercase">
                                Accesos
                            </p>
                            <Link
                                href="/productos"
                                className="text-sm text-texto-medio transition-colors hover:text-bordo"
                            >
                                Pedir precios
                            </Link>
                            <Link
                                href="/login"
                                className="text-sm text-texto-medio transition-colors hover:text-bordo"
                            >
                                Administración
                            </Link>
                        </nav>
                    </div>
                </div>

                <div className="relative z-1 border-t border-borde px-4 py-5 sm:px-6">
                    <p className="mx-auto max-w-6xl font-mono text-xs text-texto-suave">
                        © {new Date().getFullYear()} Panadería Fénix · Leones,
                        Córdoba
                    </p>
                </div>
            </footer>

            {/* Un solo acceso al pedido: el botón del header abre este panel. */}
            {!sinPedido && <PedidoPanel />}
        </div>
    );
}
