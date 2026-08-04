import {
    Ban,
    CircleAlert,
    CircleCheck,
    CircleDashed,
    CircleDot,
    Clock,
    CookingPot,
    FileText,
    Hourglass,
    PackageCheck,
    Send,
    ThumbsDown,
    Truck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/** Los estados nunca se comunican sólo por color: siempre ícono + texto. */
export type Tone = 'neutro' | 'exito' | 'alerta' | 'error' | 'info';

export type EstadoMeta = {
    label: string;
    tone: Tone;
    icon: LucideIcon;
};

/** Espeja `App\Enums\BusinessEstado`. */
export const businessEstados = {
    pendiente: { label: 'Pendiente', tone: 'alerta', icon: Hourglass },
    activo: { label: 'Activo', tone: 'exito', icon: CircleCheck },
    suspendido: { label: 'Suspendido', tone: 'error', icon: Ban },
    rechazado: { label: 'Rechazado', tone: 'neutro', icon: ThumbsDown },
} as const satisfies Record<string, EstadoMeta>;

/** Espeja `App\Enums\OrderEstado`. */
export const orderEstados = {
    pendiente: { label: 'Pendiente', tone: 'alerta', icon: Clock },
    confirmado: { label: 'Confirmado', tone: 'info', icon: CircleCheck },
    en_preparacion: { label: 'En preparación', tone: 'info', icon: CookingPot },
    listo: { label: 'Listo', tone: 'info', icon: PackageCheck },
    entregado: { label: 'Entregado', tone: 'exito', icon: Truck },
    cancelado: { label: 'Cancelado', tone: 'error', icon: Ban },
} as const satisfies Record<string, EstadoMeta>;

/** Espeja `App\Enums\QuoteRequestEstado`. */
export const quoteRequestEstados = {
    nueva: { label: 'Nueva', tone: 'alerta', icon: CircleDot },
    en_proceso: { label: 'En proceso', tone: 'info', icon: Clock },
    cotizada: { label: 'Cotizada', tone: 'info', icon: FileText },
    aceptada: { label: 'Aceptada', tone: 'exito', icon: CircleCheck },
    rechazada: { label: 'Rechazada', tone: 'neutro', icon: ThumbsDown },
    vencida: { label: 'Vencida', tone: 'error', icon: CircleAlert },
} as const satisfies Record<string, EstadoMeta>;

/** Espeja `App\Enums\QuoteEstado`. */
export const quoteEstados = {
    borrador: { label: 'Borrador', tone: 'neutro', icon: CircleDashed },
    enviada: { label: 'Enviada', tone: 'info', icon: Send },
    aceptada: { label: 'Aceptada', tone: 'exito', icon: CircleCheck },
    rechazada: { label: 'Rechazada', tone: 'neutro', icon: ThumbsDown },
    vencida: { label: 'Vencida', tone: 'error', icon: CircleAlert },
} as const satisfies Record<string, EstadoMeta>;

/** Espeja `App\Enums\ProductUnidad`. */
export const unidadBadges = {
    unidad: 'UNIDAD',
    kg: 'KG',
    docena: 'DOCENA',
    bandeja: 'BANDEJA',
} as const;

export type BusinessEstadoValue = keyof typeof businessEstados;
export type OrderEstadoValue = keyof typeof orderEstados;
export type QuoteRequestEstadoValue = keyof typeof quoteRequestEstados;
export type QuoteEstadoValue = keyof typeof quoteEstados;
export type UnidadValue = keyof typeof unidadBadges;

/** Orden de la línea de tiempo del pedido. `cancelado` es una salida, no un paso. */
export const orderTimeline = [
    'pendiente',
    'confirmado',
    'en_preparacion',
    'listo',
    'entregado',
] as const satisfies readonly OrderEstadoValue[];
