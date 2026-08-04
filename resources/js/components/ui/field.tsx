import { CircleAlert } from 'lucide-react';
import { useId } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type FieldProps = {
    label: string;
    /** Texto de ayuda debajo del control. Se oculta si hay error. */
    hint?: ReactNode;
    error?: string;
    required?: boolean;
    className?: string;
    children: (ids: { id: string; describedBy?: string; invalid: boolean }) => ReactNode;
};

/**
 * Envoltorio de un control de formulario: label, ayuda y error, con los
 * `aria-*` ya cableados. Los inputs no repiten esta plomería.
 */
export default function Field({
    label,
    hint,
    error,
    required = false,
    className,
    children,
}: FieldProps) {
    const id = useId();
    const hintId = `${id}-hint`;
    const errorId = `${id}-error`;
    const describedBy = error ? errorId : hint ? hintId : undefined;

    return (
        <div className={cn('grid gap-1.5', className)}>
            <label htmlFor={id} className="text-sm font-medium text-texto">
                {label}
                {required && (
                    <span className="ml-1 text-bordo" aria-hidden="true">
                        *
                    </span>
                )}
            </label>

            {children({ id, describedBy, invalid: Boolean(error) })}

            {error ? (
                <p id={errorId} className="flex items-start gap-1.5 text-sm text-error">
                    <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    <span>{error}</span>
                </p>
            ) : (
                hint && (
                    <p id={hintId} className="text-sm text-texto-suave">
                        {hint}
                    </p>
                )
            )}
        </div>
    );
}

/** Clases compartidas por input, textarea y select. */
export const controlClass = (invalid = false) =>
    cn(
        'w-full rounded-md border bg-papel px-3 text-sm text-texto transition-colors',
        'placeholder:text-texto-suave',
        'disabled:cursor-not-allowed disabled:bg-crema disabled:text-texto-suave',
        invalid ? 'border-error' : 'border-borde focus:border-dorado',
    );
