import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from 'lucide-react';
import { createContext, use, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { FlashLevel } from '@/types';

type Toast = {
    id: number;
    tipo: FlashLevel;
    mensaje: string;
};

type ToastContextValue = {
    push: (tipo: FlashLevel, mensaje: string) => void;
    dismiss: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const DURACION_MS = 6000;

const estilos: Record<FlashLevel, { icon: typeof Info; className: string }> = {
    exito: { icon: CircleCheck, className: 'text-exito' },
    alerta: { icon: TriangleAlert, className: 'text-alerta' },
    error: { icon: CircleAlert, className: 'text-error' },
    info: { icon: Info, className: 'text-info' },
};

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const nextId = useRef(0);

    const dismiss = useCallback((id: number) => {
        setToasts((actuales) => actuales.filter((toast) => toast.id !== id));
    }, []);

    const push = useCallback((tipo: FlashLevel, mensaje: string) => {
        const id = nextId.current++;
        setToasts((actuales) => [...actuales, { id, tipo, mensaje }]);
    }, []);

    const value = useMemo(() => ({ push, dismiss }), [push, dismiss]);

    return (
        <ToastContext value={value}>
            {children}
            <ToastViewport toasts={toasts} onDismiss={dismiss} />
        </ToastContext>
    );
}

export function useToast(): ToastContextValue {
    const context = use(ToastContext);

    if (context === null) {
        throw new Error('useToast necesita estar dentro de <ToastProvider>.');
    }

    return context;
}

function ToastViewport({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
    if (toasts.length === 0) {
        return null;
    }

    return (
        <div
            // Abajo en mobile (al alcance del pulgar), arriba a la derecha en escritorio.
            className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col gap-2 sm:inset-x-auto sm:top-4 sm:right-4 sm:bottom-auto sm:w-80"
            role="region"
            aria-label="Notificaciones"
        >
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
            ))}
        </div>
    );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
    const { icon: Icon, className } = estilos[toast.tipo];

    useEffect(() => {
        const timer = window.setTimeout(() => onDismiss(toast.id), DURACION_MS);

        return () => window.clearTimeout(timer);
    }, [toast.id, onDismiss]);

    return (
        <div
            role="status"
            aria-live="polite"
            className="pointer-events-auto flex items-start gap-2.5 rounded-md border border-borde bg-papel px-3 py-2.5 shadow-md"
        >
            <Icon className={cn('mt-0.5 size-4 shrink-0', className)} aria-hidden="true" />
            <p className="flex-1 text-sm text-texto">{toast.mensaje}</p>
            <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                aria-label="Cerrar aviso"
                className="-mt-0.5 -mr-1 rounded-sm p-1 text-texto-suave transition-colors hover:text-texto"
            >
                <X className="size-3.5" aria-hidden="true" />
            </button>
        </div>
    );
}
