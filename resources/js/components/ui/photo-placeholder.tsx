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
 * Hueco de foto mientras no haya fotografía real: masa cruda vista de cerca
 * —rayado cálido, grano de harina y un halo de horno— con la etiqueta en mono
 * de lo que va ahí. Nunca un bloque gris vacío.
 */
export default function PhotoPlaceholder({
    label,
    ratio = '4:3',
    className,
}: Props) {
    return (
        <div
            role="img"
            aria-label={`Foto pendiente: ${label}`}
            className={cn(
                'grano relative flex items-start justify-end overflow-hidden rounded-xl bg-crema ring-1 ring-borde',
                ratios[ratio],
                className,
            )}
        >
            <span
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                    backgroundImage:
                        'radial-gradient(28rem 20rem at 72% 12%, rgba(199,154,62,0.22) 0%, transparent 64%),' +
                        'repeating-linear-gradient(135deg, transparent 0 9px, rgba(199,154,62,0.14) 9px 10px)',
                }}
            />

            <span className="relative z-1 m-3 rounded-sm bg-papel/85 px-2.5 py-1 font-mono text-[10px] leading-4 tracking-[0.14em] text-texto-medio uppercase ring-1 ring-borde backdrop-blur-sm">
                Foto · {label}
            </span>
        </div>
    );
}
