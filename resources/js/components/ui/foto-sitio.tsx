import { cn } from '@/lib/utils';
import PhotoPlaceholder from './photo-placeholder';

type Ratio = '4:3' | '1:1' | '16:9' | '3:2';

const ratios: Record<Ratio, string> = {
    '4:3': 'aspect-4/3',
    '1:1': 'aspect-square',
    '16:9': 'aspect-video',
    '3:2': 'aspect-3/2',
};

type Props = {
    /** URL de la foto cargada desde el admin, o null si el hueco está vacío. */
    url?: string | null;
    /** Qué va en ese hueco. Se usa de alt y, si no hay foto, de etiqueta. */
    label: string;
    ratio?: Ratio;
    className?: string;
};

/**
 * Un hueco de foto de la landing: la foto real si la panadería la cargó, y el
 * placeholder rayado si todavía no.
 *
 * El sitio nunca queda roto por una foto que falta —ni un cuadro vacío ni un
 * `alt` colgado—, así que se puede publicar antes de tener las fotos y
 * cargarlas después sin tocar código.
 */
export default function FotoSitio({
    url,
    label,
    ratio = '4:3',
    className,
}: Props) {
    if (!url) {
        return (
            <PhotoPlaceholder
                label={label}
                ratio={ratio}
                className={className}
            />
        );
    }

    return (
        <img
            src={url}
            alt={label}
            loading="lazy"
            className={cn(
                'w-full rounded-xl object-cover ring-1 ring-borde',
                ratios[ratio],
                className,
            )}
        />
    );
}
