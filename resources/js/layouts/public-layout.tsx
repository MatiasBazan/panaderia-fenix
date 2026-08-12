import { Link } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';
import Logo from '@/components/brand/logo';
import { PedidoBoton, PedidoPanel } from '@/components/ui';
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
    const [scrolled, setScrolled] = useState(false);
    const [menuAbierto, setMenuAbierto] = useState(false);

    // La barra superior recién toma borde cuando el contenido pasa por debajo.
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <div
            className={cn(
                'flex min-h-dvh flex-col bg-crema transition-[padding] duration-200',
                // El panel se queda al costado: el contenido le hace lugar en vez
                // de quedar tapado, así se puede seguir agregando con él abierto.
                !sinPedido && panelAbierto && 'lg:pr-[22rem]',
            )}
        >
            <header
                className={cn(
                    'sticky top-0 z-30 bg-crema/95 backdrop-blur-sm transition-colors',
                    scrolled
                        ? 'border-b border-borde'
                        : 'border-b border-transparent',
                )}
            >
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
                    <Link href="/" className="text-carbon">
                        <Logo size={32} />
                    </Link>

                    <nav
                        className="hidden items-center gap-6 md:flex"
                        aria-label="Principal"
                    >
                        {navegacion.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="text-sm text-texto-medio transition-colors hover:text-bordo"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-2">
                        {!sinPedido && <PedidoBoton />}

                        <button
                            type="button"
                            onClick={() =>
                                setMenuAbierto((abierto) => !abierto)
                            }
                            aria-expanded={menuAbierto}
                            aria-label={
                                menuAbierto ? 'Cerrar menú' : 'Abrir menú'
                            }
                            className="rounded-md border border-borde bg-papel p-2 text-texto md:hidden"
                        >
                            {menuAbierto ? (
                                <X className="size-4" aria-hidden="true" />
                            ) : (
                                <Menu className="size-4" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </div>

                {menuAbierto && (
                    <nav
                        className="border-t border-borde bg-papel px-4 py-3 md:hidden"
                        aria-label="Principal"
                    >
                        <ul className="grid gap-1">
                            {navegacion.map((item) => (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        onClick={() => setMenuAbierto(false)}
                                        className="block rounded-md px-2 py-2 text-sm text-texto hover:bg-crema"
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                )}
            </header>

            <main className="flex-1">{children}</main>

            <footer className="border-t border-borde bg-papel">
                <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <Logo size={30} className="text-carbon" />
                        <p className="mt-3 max-w-xs text-sm text-texto-medio">
                            Panadería de barrio desde 1987. Horneamos todos los
                            días, incluso los domingos.
                        </p>
                    </div>

                    <div className="grid gap-2 text-sm">
                        <p className="font-semibold text-texto">Panadería</p>
                        <Link
                            href="/productos"
                            className="text-texto-medio underline underline-offset-4 hover:text-bordo"
                        >
                            Ver el catálogo
                        </Link>
                        <Link
                            href="/login"
                            className="text-texto-medio underline underline-offset-4 hover:text-bordo"
                        >
                            Administración
                        </Link>
                    </div>
                </div>

                <div className="border-t border-borde px-4 py-4">
                    <p className="mx-auto max-w-6xl font-mono text-xs text-texto-suave">
                        © {new Date().getFullYear()} Panadería Fénix · Córdoba,
                        Argentina
                    </p>
                </div>
            </footer>

            {/* Un solo acceso al pedido: el botón del header abre este panel. */}
            {!sinPedido && <PedidoPanel />}
        </div>
    );
}
