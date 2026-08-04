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
        <div className="w-full overflow-x-auto rounded-lg border border-borde bg-papel">
            <table className={cn('w-full border-collapse text-sm', className)} {...props}>
                {children}
            </table>
        </div>
    );
}

export function THead({ className, children, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
    return (
        <thead className={cn('border-b border-borde bg-crema/60', className)} {...props}>
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
        <tr className={cn('transition-colors hover:bg-crema/50', className)} {...props}>
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
                'px-3 py-2.5 text-left text-xs font-semibold tracking-wide text-texto-medio uppercase',
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
                'px-3 py-2.5 text-texto',
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
            className={cn('rounded-md border border-borde bg-papel px-3 py-3', className)}
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
            <span className="text-xs tracking-wide text-texto-medio uppercase">{label}</span>
            <span className={cn('text-sm text-texto', numeric && 'font-mono tabular-nums')}>
                {value}
            </span>
        </div>
    );
}
