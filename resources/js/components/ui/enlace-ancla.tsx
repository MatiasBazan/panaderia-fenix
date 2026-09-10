import type { AnchorHTMLAttributes, MouseEvent } from 'react';

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
    /** Siempre con hash: `/#mostrador`, `/#sobre`. */
    href: string;
};

/**
 * Enlace a una sección de la landing.
 *
 * No usa el `Link` de Inertia a propósito: una visita a `/#sobre` repinta la
 * página y resetea el scroll, así que el ancla se quedaba arriba de todo y el
 * clic no parecía hacer nada. Estando ya en la landing scrolleamos a mano;
 * desde otra pantalla dejamos que el navegador cargue `/` y salte al hash él.
 */
export default function EnlaceAncla({ href, onClick, ...props }: Props) {
    const manejarClic = (evento: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(evento);

        // Cmd/Ctrl+clic y clic del medio abren en otra pestaña: no los tocamos.
        if (
            evento.defaultPrevented ||
            evento.metaKey ||
            evento.ctrlKey ||
            evento.shiftKey ||
            window.location.pathname !== '/'
        ) {
            return;
        }

        const id = href.slice(href.indexOf('#') + 1);
        const destino = document.getElementById(id);

        if (!destino) {
            return;
        }

        evento.preventDefault();

        destino.scrollIntoView({
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)')
                .matches
                ? 'auto'
                : 'smooth',
        });

        // La URL queda compartible aunque el scroll lo hayamos hecho nosotros.
        window.history.replaceState(null, '', `#${id}`);
    };

    return <a href={href} onClick={manejarClic} {...props} />;
}
