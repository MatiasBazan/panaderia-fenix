import type { HTMLAttributes, ReactNode, ThHTMLAttributes, TdHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

/**
 * Tabla del sistema: separación por borde hairline, sin sombra, sin cebra.
 * Va envuelta en un contenedor con scroll propio para que el body nunca
 * scrollee en horizontal.
 */
export function Table({
    className,
    children,
    ...props
}: HTMLAttributes<HTMLTableElement> & { children: ReactNode }) {
    return (
        <div className="w-full overflow-x-auto rounded-xl bg-papel shadow-xs ring-1 ring-borde">
            <table className={cn('w-full border-collapse text-sm', className)} {...props}>
                {children}
            </table>
        </div>
    );
}

export function THead({ className, children, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
    return (
        <thead className={cn('border-b border-borde bg-crema/70', className)} {...props}>
            {children}
        </thead>
    );
}

export function TBody({ className, children, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
    return (
        <tbody className={cn('divide-y divide-borde', className)} {...props}>
            {children}
        </tbody>
    );
}

export function TR({ className, children, ...props }: HTMLAttributes<HTMLTableRowElement>) {
    return (
        <tr className={cn('transition-colors duration-200 hover:bg-crema/60', className)} {...props}>
            {children}
        </tr>
    );
}

type CellProps = {
    /** Alinea a la derecha y usa mono: montos, cantidades y fechas. */
    numeric?: boolean;
};

export function TH({
    className,
    numeric = false,
    children,
    ...props
}: ThHTMLAttributes<HTMLTableCellElement> & CellProps) {
    return (
        <th
            scope="col"
            className={cn(
                'px-4 py-3 text-left font-mono text-[11px] font-medium tracking-[0.14em] text-texto-suave uppercase',
                numeric && 'text-right',
                className,
            )}
            {...props}
        >
            {children}
        </th>
    );
}

export function TD({
    className,
    numeric = false,
    children,
    ...props
}: TdHTMLAttributes<HTMLTableCellElement> & CellProps) {
    return (
        <td
            className={cn(
                'px-4 py-3 text-texto',
                numeric && 'text-right font-mono tabular-nums',
                className,
            )}
            {...props}
        >
            {children}
        </td>
    );
}

/**
 * Fila de una lista apilada: la misma información que la tabla, pero en
 * tarjetas. Se usa en mobile, donde la cuenta corriente se mira de verdad.
 */
export function StackedRow({
    className,
    children,
    ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
    return (
        <div
            className={cn('rounded-lg bg-papel px-4 py-3.5 shadow-xs ring-1 ring-borde', className)}
            {...props}
        >
            {children}
        </div>
    );
}

export function StackedField({
    label,
    value,
    numeric = false,
}: {
    label: string;
    value: ReactNode;
    numeric?: boolean;
}) {
    return (
        <div className="flex items-baseline justify-between gap-3 py-0.5">
            <span className="font-mono text-[11px] tracking-[0.14em] text-texto-suave uppercase">{label}</span>
            <span className={cn('text-sm text-texto', numeric && 'font-mono tabular-nums')}>
                {value}
            </span>
        </div>
    );
}
