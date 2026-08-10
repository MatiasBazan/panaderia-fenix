import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

/** Saca del querystring los filtros vacíos, para no ensuciar la URL. */
export function limpiarQuery(
    params: Record<string, string>,
): Record<string, string> {
    return Object.fromEntries(
        Object.entries(params).filter(([, valor]) => valor !== ''),
    );
}

/**
 * Estado de los filtros de una tabla del admin. La búsqueda de texto (`q`)
 * navega con un retardo para no pegarle al servidor en cada tecla; el resto de
 * los filtros se aplican con `navegar()` al instante. Siempre preserva scroll y
 * estado, así filtrar no salta al tope de la lista.
 */
export function useTableFilters(
    baseUrl: string,
    filtros: Record<string, string | null>,
) {
    const [q, setQ] = useState(filtros.q ?? '');
    const primerRender = useRef(true);

    const navegar = (cambios: Record<string, string>) => {
        const actuales: Record<string, string> = {};

        for (const [clave, valor] of Object.entries(filtros)) {
            actuales[clave] = valor ?? '';
        }

        router.get(baseUrl, limpiarQuery({ ...actuales, ...cambios }), {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    // No dispara en el primer render: los filtros ya vienen aplicados desde la URL.
    useEffect(() => {
        if (primerRender.current) {
            primerRender.current = false;

            return;
        }

        const t = setTimeout(() => {
            if (q !== (filtros.q ?? '')) {
                navegar({ q });
            }
        }, 350);

        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q]);

    return { q, setQ, navegar };
}
