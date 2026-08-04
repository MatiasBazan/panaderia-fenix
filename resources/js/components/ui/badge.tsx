import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import {
    businessEstados,
    orderEstados,
    quoteEstados,
    quoteRequestEstados,
    unidadBadges,
} from '@/lib/estados';
import type {
    BusinessEstadoValue,
    EstadoMeta,
    OrderEstadoValue,
    QuoteEstadoValue,
    QuoteRequestEstadoValue,
    Tone,
    UnidadValue,
} from '@/lib/estados';

const tones: Record<Tone, string> = {
    neutro: 'border-borde bg-crema text-texto-medio',
    exito: 'border-exito/35 bg-exito/10 text-exito',
    alerta: 'border-alerta/35 bg-alerta/10 text-alerta',
    error: 'border-error/35 bg-error/10 text-error',
    info: 'border-info/35 bg-info/10 text-info',
};

type BadgeProps = {
    children: ReactNode;
    tone?: Tone;
    icon?: ReactNode;
    /** Mono y versalita: para unidades de venta, SKU y números de documento. */
    mono?: boolean;
    className?: string;
};

export default function Badge({
    children,
    tone = 'neutro',
    icon,
    mono = false,
    className,
}: BadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-xs leading-5 font-medium',
                tones[tone],
                mono && 'font-mono tracking-wide',
                className,
            )}
        >
            {icon}
            {children}
        </span>
    );
}

/** Badge de la unidad de venta. Toma el peso visual que en otras tiendas ocuparía el precio. */
export function UnitBadge({ unidad, className }: { unidad: UnidadValue; className?: string }) {
    return (
        <Badge mono className={className}>
            {unidadBadges[unidad]}
        </Badge>
    );
}

const registries: Record<string, Record<string, EstadoMeta>> = {
    business: businessEstados,
    order: orderEstados,
    quote: quoteEstados,
    quoteRequest: quoteRequestEstados,
};

type StatusBadgeProps =
    | { domain: 'business'; estado: BusinessEstadoValue; className?: string }
    | { domain: 'order'; estado: OrderEstadoValue; className?: string }
    | { domain: 'quote'; estado: QuoteEstadoValue; className?: string }
    | { domain: 'quoteRequest'; estado: QuoteRequestEstadoValue; className?: string };

/**
 * Badge de estado con ícono y texto. Nunca comunica sólo con color, así que
 * sigue siendo legible en blanco y negro o con daltonismo.
 */
export function StatusBadge({ domain, estado, className }: StatusBadgeProps) {
    const meta = registries[domain][estado];

    if (!meta) {
        return (
            <Badge tone="neutro" className={className}>
                {estado}
            </Badge>
        );
    }

    const Icon = meta.icon;

    return (
        <Badge
            tone={meta.tone}
            icon={<Icon className="size-3.5 shrink-0" aria-hidden="true" />}
            className={className}
        >
            {meta.label}
        </Badge>
    );
}
