import { cn } from '@/lib/utils';

type Props = {
    /** Qué foto va acá, ej. "pan de campo". */
    label: string;
    ratio?: '4:3' | '1:1' | '16:9' | '3:2';
    className?: string;
};

const ratios: Record<NonNullable<Props['ratio']>, string> = {
    '4:3': 'aspect-4/3',
    '1:1': 'aspect-square',
    '16:9': 'aspect-video',
    '3:2': 'aspect-3/2',
};

/**
 * Hueco de foto mientras no haya fotografía real: rayado cálido con la
 * etiqueta en mono de lo que va ahí. Nunca un bloque gris vacío.
 */
export default function PhotoPlaceholder({ label, ratio = '4:3', className }: Props) {
    return (
        <div
            role="img"
            aria-label={`Foto pendiente: ${label}`}
            className={cn(
                'relative flex items-end overflow-hidden rounded-md border border-borde bg-crema',
                ratios[ratio],
                className,
            )}
            style={{
                backgroundImage:
                    'repeating-linear-gradient(135deg, transparent 0 9px, rgba(199,154,62,0.14) 9px 10px)',
            }}
        >
            <span className="m-2 rounded-sm border border-borde bg-papel/90 px-2 py-1 font-mono text-[11px] leading-4 tracking-wide text-texto-medio uppercase">
                Foto · {label} · {ratio}
            </span>
        </div>
    );
}
