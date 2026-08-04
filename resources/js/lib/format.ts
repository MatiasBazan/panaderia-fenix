/**
 * Formato argentino de montos. El backend calcula; esto sólo muestra.
 * Se renderiza siempre en `font-mono`.
 */
export function money(
    monto: string | number | null | undefined,
    conSimbolo = true,
): string {
    const numero = new Intl.NumberFormat('es-AR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(monto ?? 0));

    return conSimbolo ? `$ ${numero}` : numero;
}

/** Cantidad con hasta dos decimales, sin ceros de relleno innecesarios. */
export function quantity(cantidad: string | number | null | undefined): string {
    return new Intl.NumberFormat('es-AR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(Number(cantidad ?? 0));
}

/** Fecha corta `dd/mm/aaaa`, para tablas. */
export function shortDate(fecha: string | null | undefined): string {
    if (!fecha) {
        return '—';
    }

    return new Intl.DateTimeFormat('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'America/Argentina/Cordoba',
    }).format(new Date(fecha));
}

/** Fecha larga `lunes 4 de agosto`, para el portal. */
export function longDate(fecha: string | null | undefined): string {
    if (!fecha) {
        return '—';
    }

    return new Intl.DateTimeFormat('es-AR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        timeZone: 'America/Argentina/Cordoba',
    }).format(new Date(fecha));
}
