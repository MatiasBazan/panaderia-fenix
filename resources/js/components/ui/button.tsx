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
    // Dorado con texto carbón: el único acento fuerte del sistema. El filo
    // superior y la sombra cálida le dan espesor de pieza, no de rectángulo.
    primary:
        'bg-dorado text-carbon shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_1px_2px_rgba(58,44,26,0.14)] hover:bg-dorado-hover hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_8px_18px_-6px_rgba(122,88,20,0.5)]',
    // Borde hairline sobre papel: el default de toda acción secundaria.
    secondary:
        'border border-borde bg-papel text-texto shadow-xs hover:border-dorado hover:shadow-sm',
    destructive: 'bg-bordo text-papel hover:bg-bordo-hover hover:shadow-sm',
    // Sin caja hasta el hover, para acciones de fila en tablas densas.
    quiet: 'text-texto-medio hover:bg-crema hover:text-texto',
};

const sizes: Record<ButtonSize, string> = {
    sm: 'h-8 gap-1.5 rounded-md px-3 text-sm',
    md: 'h-10 gap-2 rounded-md px-4 text-sm',
    lg: 'h-12 gap-2.5 rounded-lg px-7 text-base',
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
                'inline-flex items-center justify-center font-medium',
                'transition-[background-color,border-color,box-shadow,color,translate,scale] duration-200 ease-suave',
                // Respuesta física al clic: el botón se hunde un pelo.
                'active:translate-y-px active:scale-[0.985]',
                'disabled:cursor-not-allowed disabled:opacity-55 disabled:active:translate-y-0 disabled:active:scale-100',
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
