import type { Auth } from './auth';

export type FlashLevel = 'exito' | 'alerta' | 'error' | 'info';

export type Flash = {
    tipo: FlashLevel | null;
    mensaje: string | null;
};

/**
 * Condiciones del pedido, servidas desde `settings`. Sin importes: el sitio
 * público no muestra precios.
 */
export type Condiciones = {
    dias_anticipacion: number;
    senia: boolean;
};

/** Props que `HandleInertiaRequests` comparte en toda respuesta. */
export type SharedProps = {
    name: string;
    auth: Auth;
    flash: Flash;
    condiciones: Condiciones;
};

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & SharedProps;
