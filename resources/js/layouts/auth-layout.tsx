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
        <div className="flex min-h-dvh flex-col items-center justify-center bg-crema px-4 py-10">
            <div className="w-full max-w-sm">
                <Link href="/" className="mb-8 flex justify-center text-carbon">
                    <Logo size={36} />
                </Link>

                <div className="rounded-lg border border-borde bg-papel p-6 sm:p-8">
                    <h1 className="font-display text-2xl leading-tight text-texto">
                        {title}
                    </h1>
                    {description && (
                        <p className="mt-2 text-sm text-texto-medio">
                            {description}
                        </p>
                    )}

                    <div className="mt-6">{children}</div>
                </div>
            </div>
        </div>
    );
}
