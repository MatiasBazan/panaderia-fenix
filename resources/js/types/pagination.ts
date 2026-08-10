/** Un link del paginador de Laravel (número de página, «Anterior», «Siguiente»). */
export type PageLink = {
    url: string | null;
    label: string;
    active: boolean;
};

/**
 * Forma que toma `LengthAwarePaginator` al serializarse hacia Inertia: los
 * datos ya transformados en `data` y el resto de la metadata en la raíz.
 */
export type Paginated<T> = {
    data: T[];
    links: PageLink[];
    current_page: number;
    last_page: number;
    per_page: number;
    from: number | null;
    to: number | null;
    total: number;
};
