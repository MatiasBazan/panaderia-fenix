import { CircleAlert, Inbox, RotateCw } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Spinner({ className }: { className?: string }) {
    return (
        <svg
            className={cn('size-5 animate-spin', className)}
            viewBox="0 0 24 24"
            fill="none"
            role="status"
            aria-label="Cargando"
        >
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
            <path
                d="M21 12a9 9 0 0 0-9-9"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
            />
        </svg>
    );
}

/** Bloque gris cálido para placeholders de carga. */
export function Skeleton({ className }: { className?: string }) {
    return <div className={cn('animate-pulse rounded-sm bg-borde/60', className)} />;
}

type EmptyStateProps = {
    title: string;
    description?: ReactNode;
    icon?: ReactNode;
    action?: ReactNode;
    className?: string;
};

/** Estado vacío: qué falta y qué se puede hacer al respecto. */
export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
    return (
        <div
            className={cn(
                'flex flex-col items-center rounded-xl border border-dashed border-borde bg-papel px-6 py-14 text-center',
                className,
            )}
        >
            <span className="text-texto-suave" aria-hidden="true">
                {icon ?? <Inbox className="size-8" />}
            </span>
            <p className="mt-5 font-display text-2xl text-texto">{title}</p>
            {description && (
                <p className="mt-1.5 max-w-sm text-sm text-texto-medio">{description}</p>
            )}
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
}

type LoadingStateProps = {
    label?: string;
    className?: string;
};

export function LoadingState({ label = 'Cargando…', className }: LoadingStateProps) {
    return (
        <div
            className={cn(
                'flex flex-col items-center rounded-xl bg-papel px-6 py-14 text-center ring-1 ring-borde',
                className,
            )}
        >
            <Spinner className="size-6 text-dorado" />
            <p className="mt-3 text-sm text-texto-medio">{label}</p>
        </div>
    );
}

type ErrorStateProps = {
    title?: string;
    description?: ReactNode;
    onRetry?: () => void;
    className?: string;
};

/**
 * Estado de error. El color nunca comunica solo: siempre va con ícono y texto.
 */
export function ErrorState({
    title = 'No pudimos cargar esto',
    description,
    onRetry,
    className,
}: ErrorStateProps) {
    return (
        <div
            className={cn(
                'flex flex-col items-center rounded-xl bg-papel px-6 py-14 text-center ring-1 ring-error/40',
                className,
            )}
        >
            <CircleAlert className="size-8 text-error" aria-hidden="true" />
            <p className="mt-5 font-display text-2xl text-texto">{title}</p>
            {description && (
                <p className="mt-1.5 max-w-sm text-sm text-texto-medio">{description}</p>
            )}
            {onRetry && (
                <button
                    type="button"
                    onClick={onRetry}
                    className="mt-5 inline-flex items-center gap-2 rounded-md bg-papel px-4 py-2 text-sm font-medium text-texto ring-1 ring-borde transition-shadow duration-200 hover:ring-dorado"
                >
                    <RotateCw className="size-4" aria-hidden="true" />
                    Reintentar
                </button>
            )}
        </div>
    );
}
