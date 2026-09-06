import { useCallback, useSyncExternalStore } from 'react';
import { claveLinea, resumenPorUnidad } from '@/lib/pedido';
import type { PedidoItem } from '@/lib/pedido';

const CLAVE = 'fenix.pedido';

/** Clave anterior, cuando el panel se llamaba «cotización». Se migra al leer. */
const CLAVE_VIEJA = 'fenix.cotizacion';

/**
 * El pedido que arma un visitante anónimo vive en su navegador, no en sesión
 * del servidor: no hay cuenta, no hace falta estado en el backend y sobrevive
 * a las páginas cacheadas. Al enviar, el servidor revalida todo.
 */
let cache: PedidoItem[] = [];
let cacheRaw: string | null = null;
const listeners = new Set<() => void>();

function normalizar(valor: unknown): PedidoItem[] {
    if (!Array.isArray(valor)) {
        return [];
    }

    return (valor as PedidoItem[]).filter(
        (item) =>
            typeof item?.id === 'number' && typeof item?.cantidad === 'number',
    );
}

function leer(): PedidoItem[] {
    if (typeof window === 'undefined') {
        return [];
    }

    let raw = window.localStorage.getItem(CLAVE);

    // Migración de la clave vieja: se mueve una sola vez y no se vuelve a mirar.
    if (raw === null) {
        const heredado = window.localStorage.getItem(CLAVE_VIEJA);

        if (heredado !== null) {
            window.localStorage.setItem(CLAVE, heredado);
            window.localStorage.removeItem(CLAVE_VIEJA);
            raw = heredado;
        }
    }

    // Se cachea el parseo: getSnapshot tiene que devolver la misma referencia.
    if (raw === cacheRaw) {
        return cache;
    }

    cacheRaw = raw;

    try {
        cache = normalizar(raw === null ? [] : JSON.parse(raw));
    } catch {
        cache = [];
    }

    return cache;
}

function escribir(items: PedidoItem[]): void {
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

export default function usePedido() {
    const items = useSyncExternalStore(subscribe, leer, () => cache);

    const agregar = useCallback(
        (item: Omit<PedidoItem, 'cantidad'>, cantidad: number) => {
            const actuales = leer();
            const clave = claveLinea(item.id, item.variante);
            const existe = actuales.some(
                (i) => claveLinea(i.id, i.variante) === clave,
            );

            escribir(
                existe
                    ? actuales.map((i) =>
                          claveLinea(i.id, i.variante) === clave
                              ? {
                                    ...i,
                                    ...item,
                                    cantidad: i.cantidad + cantidad,
                                }
                              : i,
                      )
                    : [...actuales, { ...item, cantidad }],
            );
        },
        [],
    );

    const actualizar = useCallback(
        (clave: string, cambios: Partial<PedidoItem>) => {
            escribir(
                leer().map((i) =>
                    claveLinea(i.id, i.variante) === clave
                        ? { ...i, ...cambios }
                        : i,
                ),
            );
        },
        [],
    );

    const quitar = useCallback((clave: string) => {
        escribir(
            leer().filter((i) => claveLinea(i.id, i.variante) !== clave),
        );
    }, []);

    const vaciar = useCallback(() => {
        escribir([]);
    }, []);

    const cantidadDe = useCallback(
        (clave: string): number =>
            items.find((i) => claveLinea(i.id, i.variante) === clave)
                ?.cantidad ?? 0,
        [items],
    );

    return {
        items,
        /** Productos distintos: es lo que cuenta el globo del carrito. */
        lineas: items.length,
        resumen: resumenPorUnidad(items),
        cantidadDe,
        agregar,
        actualizar,
        quitar,
        vaciar,
    };
}

/*
|--------------------------------------------------------------------------
| Panel lateral
|--------------------------------------------------------------------------
| Vive fuera de React para que cualquier tarjeta del catálogo pueda abrirlo
| sin que el layout tenga que pasar props hasta el fondo del árbol. Se guarda
| abierto o cerrado: el panel es una preferencia de trabajo, no un aviso, y
| tiene que seguir como lo dejaste al cambiar de página o recargar.
*/

const CLAVE_PANEL = 'fenix.pedido.panel';

/** Debajo de esto la pantalla no da para tener el panel y el catálogo a la vez. */
const ANCHO_ESCRITORIO = '(min-width: 1024px)';

let abierto = false;
let panelLeido = false;
const oyentesPanel = new Set<() => void>();

function leerPanel(): boolean {
    if (typeof window === 'undefined') {
        return false;
    }

    if (!panelLeido) {
        abierto = window.localStorage.getItem(CLAVE_PANEL) === '1';
        panelLeido = true;
    }

    return abierto;
}

function suscribirPanel(listener: () => void): () => void {
    oyentesPanel.add(listener);

    return () => {
        oyentesPanel.delete(listener);
    };
}

function setAbierto(valor: boolean): void {
    leerPanel();

    if (abierto === valor) {
        return;
    }

    abierto = valor;
    panelLeido = true;
    window.localStorage.setItem(CLAVE_PANEL, valor ? '1' : '0');
    oyentesPanel.forEach((listener) => listener());
}

/** Hay lugar para dejar el panel abierto al costado sin tapar el catálogo. */
export function hayLugarParaElPanel(): boolean {
    return (
        typeof window !== 'undefined' &&
        window.matchMedia(ANCHO_ESCRITORIO).matches
    );
}

export function usePanelPedido() {
    const estaAbierto = useSyncExternalStore(
        suscribirPanel,
        leerPanel,
        () => false,
    );

    return {
        abierto: estaAbierto,
        abrir: useCallback(() => setAbierto(true), []),
        cerrar: useCallback(() => setAbierto(false), []),
        alternar: useCallback(() => setAbierto(!leerPanel()), []),
    };
}
