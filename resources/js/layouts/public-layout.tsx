import { Link } from '@inertiajs/react';
import { ClipboardList, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';
import Logo from '@/components/brand/logo';
import { Button } from '@/components/ui';
import useCotizacion from '@/hooks/use-cotizacion';
import useFlashToast from '@/hooks/use-flash-toast';
import { cn } from '@/lib/utils';

const navegacion = [
    { href: '/productos', label: 'Productos' },
    { href: '/#sobre', label: 'La panadería' },
    { href: '/#ubicacion', label: 'Dónde estamos' },
];

type Props = PropsWithChildren<{
    /** Oculta la barra flotante de cotización (en la propia pantalla de cotización). */
    hideQuoteBar?: boolean;
}>;

export default function PublicLayout({
    children,
    hideQuoteBar = false,
}: Props) {
    useFlashToast();

    const { items, cantidadTotal } = useCotizacion();
    const [scrolled, setScrolled] = useState(false);
    const [menuAbierto, setMenuAbierto] = useState(false);

    // La barra superior recién toma borde cuando el contenido pasa por debajo.
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const idsQuery = items.map((item) => item.id).join(',');

    return (
        <div className="flex min-h-dvh flex-col bg-crema">
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
                        <Link
                            href="/login"
                            className="text-sm font-medium text-texto underline underline-offset-4 transition-colors hover:text-bordo"
                        >
                            Acceso comercios
                        </Link>
                    </nav>

                    <button
                        type="button"
                        onClick={() => setMenuAbierto((abierto) => !abierto)}
                        aria-expanded={menuAbierto}
                        aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
                        className="rounded-md border border-borde bg-papel p-2 text-texto md:hidden"
                    >
                        {menuAbierto ? (
                            <X className="size-4" aria-hidden="true" />
                        ) : (
                            <Menu className="size-4" aria-hidden="true" />
                        )}
                    </button>
                </div>

                {menuAbierto && (
                    <nav
                        className="border-t border-borde bg-papel px-4 py-3 md:hidden"
                        aria-label="Principal"
                    >
                        <ul className="grid gap-1">
                            {[
                                ...navegacion,
                                { href: '/login', label: 'Acceso comercios' },
                            ].map((item) => (
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
                        <p className="font-semibold text-texto">Comercios</p>
                        <Link
                            href="/comercios/solicitar"
                            className="text-texto-medio underline underline-offset-4 hover:text-bordo"
                        >
                            Pedir alta mayorista
                        </Link>
                        <Link
                            href="/login"
                            className="text-texto-medio underline underline-offset-4 hover:text-bordo"
                        >
                            Ingresar al portal
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

            {/* Barra flotante: cuántos productos lleva armados y por dónde sigue. */}
            {!hideQuoteBar && cantidadTotal > 0 && (
                <div className="sticky bottom-0 z-30 border-t border-borde bg-papel shadow-lg">
                    <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
                        <p className="flex items-center gap-2 text-sm text-texto">
                            <ClipboardList
                                className="size-4 shrink-0 text-dorado"
                                aria-hidden="true"
                            />
                            <span>
                                <span className="font-mono font-medium">
                                    {cantidadTotal}
                                </span>{' '}
                                {cantidadTotal === 1 ? 'producto' : 'productos'}{' '}
                                en tu cotización
                            </span>
                        </p>
                        <Link href={`/cotizacion?items=${idsQuery}`}>
                            <Button size="sm">Pedir cotización</Button>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
