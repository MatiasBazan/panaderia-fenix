import { usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/toast';
import type { PageProps } from '@/types';

/**
 * Convierte el flash que manda el backend en un toast.
 * Se dispara una sola vez por respuesta, comparando la URL de la página.
 */
export default function useFlashToast(): void {
    const { props, url } = usePage<PageProps>();
    const flash = props.flash;
    const ultimo = useRef<string | null>(null);
    const { push } = useToast();

    useEffect(() => {
        if (!flash?.tipo || !flash.mensaje) {
            return;
        }

        const huella = `${url}|${flash.tipo}|${flash.mensaje}`;

        if (ultimo.current === huella) {
            return;
        }

        ultimo.current = huella;
        push(flash.tipo, flash.mensaje);
    }, [flash, url, push]);
}
