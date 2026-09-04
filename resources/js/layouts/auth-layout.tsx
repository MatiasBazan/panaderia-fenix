import { Link } from '@inertiajs/react';
import type { PropsWithChildren, ReactNode } from 'react';
import Logo from '@/components/brand/logo';
import useFlashToast from '@/hooks/use-flash-toast';

type Props = PropsWithChildren<{
    title: string;
    description?: ReactNode;
}>;

/**
 * Pantalla sobria para login y claves. Sin fotos de producto: acá se entra a
 * trabajar, no a mirar. Fondo crema, tarjeta papel con borde hairline.
 */
export default function AuthLayout({ title, description, children }: Props) {
    useFlashToast();

    return (
        <div className="grano relative flex min-h-dvh flex-col items-center justify-center bg-crema halo-horno px-4 py-10">
            <div className="relative z-1 w-full max-w-sm">
                <Link href="/" className="mb-8 flex justify-center text-carbon">
                    <Logo size={36} />
                </Link>

                <div className="rounded-xl bg-papel p-6 shadow-lg ring-1 filo ring-borde sm:p-8">
                    <h1 className="font-display text-3xl leading-tight text-texto">
                        {title}
                    </h1>
                    {description && (
                        <p className="mt-2.5 text-sm leading-relaxed text-texto-medio">
                            {description}
                        </p>
                    )}

                    <div className="mt-7">{children}</div>
                </div>
            </div>
        </div>
    );
}
