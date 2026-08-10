import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import type { Paginated } from '@/types';

type Props = {
    /** El paginador completo; se leen `links`, `from`, `to` y `total`. */
    meta: Pick<Paginated<unknown>, 'links' | 'from' | 'to' | 'total'>;
    className?: string;
};

const enlaceBase =
    'inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-2.5 text-sm transition-colors';

/**
 * Navegación de páginas sobre el paginador de Laravel. Preserva scroll y estado
 * para que filtrar y paginar no salte al tope de la lista.
 */
export default function Pagination({ meta, className }: Props) {
    // Con una sola página, Laravel deja tres links (anterior, «1», siguiente):
    // no vale la pena mostrar la barra.
    if (meta.links.length <= 3) {
        return null;
    }

    return (
        <nav
            className={cn('flex flex-wrap items-center justify-between gap-3', className)}
            aria-label="Paginación"
        >
            <p className="text-sm text-texto-medio">
                {meta.from ?? 0}–{meta.to ?? 0} de {meta.total}
            </p>

            <ul className="flex flex-wrap items-center gap-1">
                {meta.links.map((link, i) => (
                    <li key={i}>
                        {link.url === null ? (
                            <span
                                className={cn(enlaceBase, 'border-transparent text-texto-suave')}
                                // Etiquetas del framework: «&laquo; Anterior», «Siguiente &raquo;».
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ) : (
                            <Link
                                href={link.url}
                                preserveScroll
                                preserveState
                                aria-current={link.active ? 'page' : undefined}
                                className={cn(
                                    enlaceBase,
                                    link.active
                                        ? 'border-dorado bg-dorado text-carbon'
                                        : 'border-borde bg-papel text-texto hover:border-dorado',
                                )}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        )}
                    </li>
                ))}
            </ul>
        </nav>
    );
}
