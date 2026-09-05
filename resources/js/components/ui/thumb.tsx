import { ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
    /** URL de la foto, o null para el hueco con ícono. */
    src: string | null;
    /** Clases de tamaño, ej. `size-11`. */
    className?: string;
};

/** Miniatura cuadrada: la foto si existe, o un ícono de «sin imagen». */
export default function Thumb({ src, className }: Props) {
    if (src) {
        return (
            <img
                src={src}
                alt=""
                className={cn(
                    'shrink-0 rounded-lg object-cover ring-1 ring-borde',
                    className,
                )}
            />
        );
    }

    return (
        <div
            className={cn(
                'flex shrink-0 items-center justify-center rounded-lg bg-crema text-texto-suave ring-1 ring-borde',
                className,
            )}
        >
            <ImageOff className="size-4" aria-hidden="true" />
        </div>
    );
}
