import { useCallback, useSyncExternalStore } from 'react';
import type { UnidadValue } from '@/lib/estados';

export type CotizacionItem = {
    id: number;
    slug: string;
    nombre: string;
    unidad: UnidadValue;
    cantidad: number;
    nota?: string;
};

const CLAVE = 'fenix.cotizacion';

/**
 * La lista que arma un visitante anónimo vive en su navegador, no en sesión
 * del servidor: no hay cuenta, no hace falta estado en el backend y sobrevive
 * a las páginas cacheadas. Al enviar, el servidor revalida todo.
 */
let cache: CotizacionItem[] = [];
let cacheRaw: string | null = null;
const listeners = new Set<() => void>();

function leer(): CotizacionItem[] {
    if (typeof window === 'undefined') {
        return [];
    }

    const raw = window.localStorage.getItem(CLAVE);

    // Se cachea el parseo: getSnapshot tiene que devolver la misma referencia.
    if (raw === cacheRaw) {
        return cache;
    }

    cacheRaw = raw;

    try {
        const parsed: unknown = raw === null ? [] : JSON.parse(raw);
        cache = Array.isArray(parsed) ? (parsed as CotizacionItem[]) : [];
    } catch {
        cache = [];
    }

    return cache;
}

function escribir(items: CotizacionItem[]): void {
    window.localStorage.setItem(CLAVE, JSON.stringify(items));
    listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    // Mantiene sincronizadas dos pestañas abiertas del catálogo.
    window.addEventListener('storage', listener);

    return () => {
        listeners.delete(listener);
        window.removeEventListener('storage', listener);
    };
}

export default function useCotizacion() {
    const items = useSyncExternalStore(subscribe, leer, () => cache);

    const agregar = useCallback(
        (item: Omit<CotizacionItem, 'cantidad'>, cantidad: number) => {
            const actuales = leer();
            const existente = actuales.find((i) => i.id === item.id);

            escribir(
                existente
                    ? actuales.map((i) =>
                          i.id === item.id
                              ? { ...i, cantidad: i.cantidad + cantidad }
                              : i,
                      )
                    : [...actuales, { ...item, cantidad }],
            );
        },
        [],
    );

    const actualizar = useCallback(
        (id: number, cambios: Partial<CotizacionItem>) => {
            escribir(
                leer().map((i) => (i.id === id ? { ...i, ...cambios } : i)),
            );
        },
        [],
    );

    const quitar = useCallback((id: number) => {
        escribir(leer().filter((i) => i.id !== id));
    }, []);

    const vaciar = useCallback(() => {
        escribir([]);
    }, []);

    return {
        items,
        cantidadTotal: items.length,
        agregar,
        actualizar,
        quitar,
        vaciar,
    };
}
