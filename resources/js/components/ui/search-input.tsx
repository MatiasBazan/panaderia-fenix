import { Search } from 'lucide-react';
import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { controlClass } from './field';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
    /** Etiqueta accesible (queda oculta a la vista). */
    label?: string;
};

/**
 * Campo de búsqueda del sistema: la misma piel que el resto de los controles,
 * con la lupa adentro. Se usa en las tablas del admin.
 */
export default function SearchInput({
    label = 'Buscar',
    className,
    ...props
}: Props) {
    return (
        <label className="relative block">
            <span className="sr-only">{label}</span>
            <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-texto-medio"
                aria-hidden="true"
            />
            <input
                type="search"
                className={cn(controlClass(), 'h-10 pr-3 pl-9', className)}
                {...props}
            />
        </label>
    );
}
