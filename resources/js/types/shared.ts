import type { Auth } from './auth';

export type FlashLevel = 'exito' | 'alerta' | 'error' | 'info';

export type Flash = {
    tipo: FlashLevel | null;
    mensaje: string | null;
};

/** Props que `HandleInertiaRequests` comparte en toda respuesta. */
export type SharedProps = {
    name: string;
    auth: Auth;
    flash: Flash;
};

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & SharedProps;
