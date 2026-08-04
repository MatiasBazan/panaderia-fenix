import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { MouseEvent, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Props = {
    open: boolean;
    onClose: () => void;
    title: string;
    description?: ReactNode;
    children?: ReactNode;
    /** Botonera inferior. Se alinea a la derecha. */
    footer?: ReactNode;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
};

const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
};

/**
 * Modal sobre `<dialog>` nativo: el foco atrapado, el cierre con Escape y el
 * `inert` del fondo los resuelve el navegador, sin librería de por medio.
 * Es de las pocas superficies con sombra: acá hay elevación real.
 */
export default function Modal({
    open,
    onClose,
    title,
    description,
    children,
    footer,
    size = 'md',
    className,
}: Props) {
    const ref = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = ref.current;

        if (!dialog) {
            return;
        }

        if (open && !dialog.open) {
            dialog.showModal();
        } else if (!open && dialog.open) {
            dialog.close();
        }
    }, [open]);

    // Cierra al hacer clic fuera de la tarjeta: el backdrop es el propio <dialog>.
    const handleClick = (event: MouseEvent<HTMLDialogElement>) => {
        if (event.target === ref.current) {
            onClose();
        }
    };

    return (
        <dialog
            ref={ref}
            onClose={onClose}
            onCancel={onClose}
            onClick={handleClick}
            aria-labelledby="modal-title"
            className={cn(
                'w-[calc(100%-2rem)] rounded-lg border border-borde bg-papel p-0 text-texto shadow-lg',
                'backdrop:bg-carbon/45 open:m-auto',
                sizes[size],
                className,
            )}
        >
            <div className="flex items-start justify-between gap-4 border-b border-borde px-5 py-4">
                <div>
                    <h2 id="modal-title" className="font-display text-xl leading-tight">
                        {title}
                    </h2>
                    {description && <p className="mt-1 text-sm text-texto-medio">{description}</p>}
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Cerrar"
                    className="-mt-1 -mr-1 rounded-md p-1.5 text-texto-medio transition-colors hover:bg-crema hover:text-texto"
                >
                    <X className="size-4" aria-hidden="true" />
                </button>
            </div>

            {children && <div className="px-5 py-4">{children}</div>}

            {footer && (
                <div className="flex flex-wrap justify-end gap-2 border-t border-borde bg-crema/50 px-5 py-3">
                    {footer}
                </div>
            )}
        </dialog>
    );
}
