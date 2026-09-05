export type UserRole = 'admin';

export type BusinessEstado =
    'pendiente' | 'activo' | 'suspendido' | 'rechazado';

export type BusinessSummary = {
    id: number;
    razon_social: string;
    nombre_fantasia: string | null;
    estado: BusinessEstado;
    descuento_porcentaje: string;
    saldo_actual: string;
    limite_credito: string | null;
};

export type User = {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    business_id: number | null;
    must_change_password: boolean;
    last_login_at: string | null;
    business?: BusinessSummary | null;
    [key: string]: unknown;
};

export type Auth = {
    user: User | null;
};
