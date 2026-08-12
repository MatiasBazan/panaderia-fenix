import { Link } from '@inertiajs/react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type Paso = {
    label: string;
    /** Sólo los pasos ya completados son navegables hacia atrás. */
    href?: string;
};

type Props = {
    pasos: Paso[];
    /** Índice del paso en curso, base 0. */
    actual: number;
    className?: string;
};

/**
 * Indicador de pasos del pedido. Existe para responder «¿dónde estoy y cuánto
 * falta?» antes de que la persona tenga que deducirlo del contenido.
 */
export default function Pasos({ pasos, actual, className }: Props) {
    return (
        <ol
            className={cn('flex flex-wrap items-center gap-x-3 gap-y-2', className)}
            aria-label="Pasos del pedido"
        >
            {pasos.map((paso, indice) => {
                const completado = indice < actual;
                const enCurso = indice === actual;

                const contenido = (
                    <span
                        className={cn(
                            'inline-flex items-center gap-2 text-sm',
                            enCurso
                                ? 'font-medium text-texto'
                                : 'text-texto-medio',
                        )}
                    >
                        <span
                            className={cn(
                                'flex size-6 shrink-0 items-center justify-center rounded-full border font-mono text-xs',
                                completado &&
                                    'border-exito/40 bg-exito/10 text-exito',
                                enCurso && 'border-bordo bg-bordo text-crema',
                                !completado &&
                                    !enCurso &&
                                    'border-borde text-texto-suave',
                            )}
                        >
                            {completado ? (
                                <Check className="size-3.5" aria-hidden="true" />
                            ) : (
                                indice + 1
                            )}
                        </span>
                        {paso.label}
                    </span>
                );

                return (
                    <li key={paso.label} className="flex items-center gap-3">
                        {completado && paso.href ? (
                            <Link
                                href={paso.href}
                                className="underline-offset-4 hover:underline"
                                aria-label={`Volver a ${paso.label}`}
                            >
                                {contenido}
                            </Link>
                        ) : (
                            <span aria-current={enCurso ? 'step' : undefined}>
                                {contenido}
                            </span>
                        )}

                        {indice < pasos.length - 1 && (
                            <span
                                aria-hidden="true"
                                className="h-px w-6 bg-borde sm:w-10"
                            />
                        )}
                    </li>
                );
            })}
        </ol>
    );
}
