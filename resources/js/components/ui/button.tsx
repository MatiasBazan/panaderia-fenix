import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Spinner } from './states';

export type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'quiet';
export type ButtonSize = 'sm' | 'md' | 'lg';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    /** Muestra spinner y bloquea el botón. */
    loading?: boolean;
    /** Ícono a la izquierda del texto. */
    icon?: ReactNode;
    block?: boolean;
};

const variants: Record<ButtonVariant, string> = {
    // Dorado con texto carbón: el único acento fuerte del sistema.
    primary: 'bg-dorado text-carbon hover:bg-dorado-hover',
    // Borde hairline sobre papel: el default de toda acción secundaria.
    secondary: 'border border-borde bg-papel text-texto hover:border-dorado',
    destructive: 'bg-bordo text-papel hover:bg-bordo-hover',
    // Sin caja hasta el hover, para acciones de fila en tablas densas.
    quiet: 'text-texto-medio hover:bg-crema hover:text-texto',
};

const sizes: Record<ButtonSize, string> = {
    sm: 'h-8 gap-1.5 px-3 text-sm',
    md: 'h-10 gap-2 px-4 text-sm',
    lg: 'h-12 gap-2 px-6 text-base',
};

export default function Button({
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    block = false,
    className,
    children,
    disabled,
    type = 'button',
    ...props
}: Props) {
    return (
        <button
            type={type}
            disabled={disabled || loading}
            aria-busy={loading || undefined}
            className={cn(
                'inline-flex items-center justify-center rounded-md font-medium transition-colors',
                'disabled:cursor-not-allowed disabled:opacity-55',
                variants[variant],
                sizes[size],
                block && 'w-full',
                className,
            )}
            {...props}
        >
            {loading ? <Spinner className="size-4" /> : icon}
            {children}
        </button>
    );
}
