import { cn } from '@/lib/utils';

type Props = {
    className?: string;
    /** Alto del emblema en píxeles. El ancho sale de la relación 4:3. */
    size?: number;
    withWordmark?: boolean;
};

/**
 * Emblema de la panadería. Es un raster con transparencia, servido en cuatro
 * anchos para que el navegador elija según densidad de pantalla.
 *
 * El emblema trae su propio "Fenix" en cursiva, pero es ilegible por debajo de
 * unos 120 px de alto, así que el nombre completo se acompaña en DM Serif.
 */
export default function Logo({ className, size = 32, withWordmark = true }: Props) {
    const width = Math.round((size * 4) / 3);

    return (
        <span className={cn('inline-flex items-center gap-2.5', className)}>
            <img
                src="/img/logo-192.png"
                srcSet="/img/logo-96.png 96w, /img/logo-192.png 192w, /img/logo-384.png 384w, /img/logo-768.png 768w"
                sizes={`${width}px`}
                width={width}
                height={size}
                // Con el wordmark al lado, el texto ya nombra la marca: el lector
                // de pantalla no tiene que oírlo dos veces.
                alt={withWordmark ? '' : 'Panadería Fénix'}
                aria-hidden={withWordmark || undefined}
                className="shrink-0 object-contain"
                style={{ width, height: size }}
            />
            {withWordmark && (
                <span className="font-display text-xl leading-none tracking-tight">
                    Panadería Fénix
                </span>
            )}
        </span>
    );
}
