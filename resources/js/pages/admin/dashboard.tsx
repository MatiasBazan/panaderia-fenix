import { Link } from '@inertiajs/react';
import { ArrowRight, ClipboardList } from 'lucide-react';
import { useState } from 'react';
import { StatusBadge, Table, TBody, TD, TH, THead, TR } from '@/components/ui';
import { EmptyState } from '@/components/ui/states';
import AdminLayout from '@/layouts/admin-layout';
import type { QuoteRequestEstadoValue } from '@/lib/estados';
import { dayMonth, plainDayLabel, shortDate } from '@/lib/format';
import { cn } from '@/lib/utils';

type Metricas = {
    solicitudes_pendientes: number;
    cotizaciones_borrador: number;
    cotizaciones_enviadas: number;
    cotizaciones_por_vencer: number;
    productos_activos: number;
    categorias_activas: number;
    comercios_activos: number;
    comercios_pendientes: number;
};

type Dia = { dia: string; total: number };

type Solicitud = {
    id: number;
    nombre: string;
    localidad: string | null;
    items_count: number;
    estado: QuoteRequestEstadoValue;
    estado_label: string;
    creada_el: string | null;
    cotizacion_numero: string | null;
};

type Props = {
    metricas: Metricas;
    serie_solicitudes: Dia[];
    ultimas_solicitudes: Solicitud[];
};

/**
 * Tarjeta grande de la fila de arriba: lo que está esperando una respuesta.
 * El número manda y se pinta en bordó cuando hay trabajo pendiente.
 */
function Pendiente({
    label,
    valor,
    detalle,
    href,
}: {
    label: string;
    valor: number;
    detalle: string;
    href?: string;
}) {
    const hayTrabajo = valor > 0;

    const contenido = (
        <>
            <p className="font-mono text-[11px] tracking-[0.16em] text-texto-suave uppercase">
                {label}
            </p>
            <p
                className={cn(
                    'mt-4 font-mono text-5xl leading-none tabular-nums',
                    hayTrabajo ? 'text-bordo' : 'text-texto-suave',
                )}
            >
                {valor}
            </p>
            <p className="mt-3 text-sm text-texto-medio">{detalle}</p>
            {href && (
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-texto-medio transition-colors group-hover:text-bordo">
                    Ver
                    <ArrowRight
                        className="size-3.5 transition-transform duration-200 ease-suave group-hover:translate-x-0.5"
                        aria-hidden="true"
                    />
                </span>
            )}
        </>
    );

    const clase =
        'group flex flex-col rounded-xl bg-papel p-6 shadow-xs ring-1 ring-borde transition-[box-shadow,translate] duration-300 ease-suave';

    return href ? (
        <Link
            href={href}
            className={cn(clase, 'hover:-translate-y-0.5 hover:shadow-md')}
        >
            {contenido}
        </Link>
    ) : (
        <div className={clase}>{contenido}</div>
    );
}

/** Métrica secundaria: una línea, sin caja propia. */
function Dato({
    label,
    valor,
    href,
}: {
    label: string;
    valor: number;
    href?: string;
}) {
    const contenido = (
        <>
            <dt className="text-sm text-texto-medio">{label}</dt>
            <dd className="mt-1.5 font-mono text-2xl text-texto tabular-nums">
                {valor}
            </dd>
        </>
    );

    return href ? (
        <Link
            href={href}
            className="block border-t border-borde pt-4 transition-colors hover:border-dorado"
        >
            {contenido}
        </Link>
    ) : (
        <div className="border-t border-borde pt-4">{contenido}</div>
    );
}

/**
 * Actividad de las últimas dos semanas. Una sola serie, así que no lleva
 * leyenda: el título la nombra. La barra más alta va rotulada; el resto se
 * lee al pasar el puntero, y abajo queda la tabla equivalente para lectores
 * de pantalla.
 */
function Actividad({ serie }: { serie: Dia[] }) {
    const [activo, setActivo] = useState<number | null>(null);

    const maximo = Math.max(...serie.map((d) => d.total), 0);
    // Techo mínimo del eje: con una sola solicitud, escalar al máximo real
    // dibujaría una barra que toca el borde y exagera lo que pasó.
    const escala = Math.max(maximo, 4);
    const total = serie.reduce((suma, d) => suma + d.total, 0);
    const indiceMaximo = serie.findIndex((d) => d.total === maximo);

    return (
        <figure className="rounded-xl bg-papel p-6 shadow-xs ring-1 ring-borde">
            <figcaption className="flex flex-wrap items-baseline justify-between gap-3">
                <div>
                    <h2 className="font-display text-2xl text-texto">
                        Solicitudes recibidas
                    </h2>
                    <p className="mt-1 text-sm text-texto-medio">
                        Últimos 14 días.
                    </p>
                </div>
                <p className="font-mono text-sm text-texto-medio">
                    <span className="text-2xl text-texto tabular-nums">
                        {total}
                    </span>{' '}
                    en el período
                </p>
            </figcaption>

            {total === 0 ? (
                <p className="mt-8 border-t border-borde pt-6 text-sm text-texto-medio">
                    No entró ninguna solicitud en estos catorce días.
                </p>
            ) : (
                <div className="relative mt-8">
                    {/* Línea de base: la única regla del gráfico. */}
                    <div className="flex h-44 items-end gap-[2px] border-b border-borde">
                        {serie.map((d, indice) => {
                            const alto = Math.round((d.total / escala) * 100);

                            return (
                                <div
                                    key={d.dia}
                                    className="group relative flex h-full flex-1 items-end"
                                    onMouseEnter={() => setActivo(indice)}
                                    onMouseLeave={() => setActivo(null)}
                                >
                                    {/* Zona sensible: toma toda la columna, no sólo la barra. */}
                                    <div
                                        className={cn(
                                            'w-full rounded-t-[4px] transition-[height,background-color] duration-300 ease-suave',
                                            d.total === 0
                                                ? 'bg-borde'
                                                : 'bg-dorado-hover group-hover:bg-bordo',
                                        )}
                                        style={{
                                            height:
                                                d.total === 0
                                                    ? '2px'
                                                    : `max(6px, ${alto}%)`,
                                        }}
                                    />

                                    {indice === indiceMaximo &&
                                        activo === null && (
                                            <span
                                                className="pointer-events-none absolute inset-x-0 text-center font-mono text-xs text-texto"
                                                style={{
                                                    bottom: `calc(max(6px, ${alto}%) + 6px)`,
                                                }}
                                            >
                                                {d.total}
                                            </span>
                                        )}

                                    {activo === indice && (
                                        <div
                                            className="pointer-events-none absolute left-1/2 z-10 w-max max-w-44 -translate-x-1/2 rounded-md bg-carbon px-2.5 py-1.5 text-xs text-crema shadow-lg"
                                            style={{
                                                bottom: `calc(max(6px, ${alto}%) + 10px)`,
                                            }}
                                        >
                                            <span className="font-mono tabular-nums">
                                                {d.total}
                                            </span>{' '}
                                            {d.total === 1
                                                ? 'solicitud'
                                                : 'solicitudes'}
                                            <span className="mt-0.5 block text-crema/70">
                                                {plainDayLabel(d.dia)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Eje: sólo los extremos y el medio, para no amontonar. */}
                    <div className="mt-2 flex justify-between font-mono text-[11px] text-texto-suave">
                        <span>{dayMonth(serie[0].dia)}</span>
                        <span className="hidden sm:inline">
                            {dayMonth(serie[Math.floor(serie.length / 2)].dia)}
                        </span>
                        <span>{dayMonth(serie[serie.length - 1].dia)}</span>
                    </div>
                </div>
            )}

            {/* Los mismos números en texto, para quien no ve el gráfico. */}
            <table className="sr-only">
                <caption>Solicitudes recibidas por día</caption>
                <thead>
                    <tr>
                        <th scope="col">Día</th>
                        <th scope="col">Solicitudes</th>
                    </tr>
                </thead>
                <tbody>
                    {serie.map((d) => (
                        <tr key={d.dia}>
                            <th scope="row">{plainDayLabel(d.dia)}</th>
                            <td>{d.total}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </figure>
    );
}

export default function AdminDashboard({
    metricas: m,
    serie_solicitudes,
    ultimas_solicitudes,
}: Props) {
    return (
        <AdminLayout
            eyebrow="Administración"
            title="Dashboard"
            description="Qué está esperando una respuesta de la panadería, y cómo viene la semana."
        >
            <section aria-label="Pendientes">
                <div className="grid gap-5 sm:grid-cols-3">
                    <Pendiente
                        label="Solicitudes pendientes"
                        valor={m.solicitudes_pendientes}
                        detalle="Entraron por el sitio y todavía no se respondieron."
                        href="/admin/cotizaciones?estado=pendientes"
                    />
                    <Pendiente
                        label="Cotizaciones borrador"
                        valor={m.cotizaciones_borrador}
                        detalle="Armadas pero sin enviar al cliente."
                        href="/admin/cotizaciones"
                    />
                    <Pendiente
                        label="Vencen en 7 días"
                        valor={m.cotizaciones_por_vencer}
                        detalle="Enviadas, con la validez por terminarse."
                    />
                </div>
            </section>

            <section aria-label="Actividad" className="mt-8">
                <Actividad serie={serie_solicitudes} />
            </section>

            <section aria-label="Catálogo y comercios" className="mt-12">
                <h2 className="font-mono text-[11px] tracking-[0.2em] text-texto-suave uppercase">
                    El resto del sistema
                </h2>
                <dl className="mt-5 grid grid-cols-2 gap-x-8 gap-y-6 lg:grid-cols-4">
                    <Dato
                        label="Cotizaciones enviadas"
                        valor={m.cotizaciones_enviadas}
                        href="/admin/cotizaciones"
                    />
                    <Dato
                        label="Productos activos"
                        valor={m.productos_activos}
                        href="/admin/productos?estado=activo"
                    />
                    <Dato
                        label="Categorías activas"
                        valor={m.categorias_activas}
                        href="/admin/categorias"
                    />
                    <Dato
                        label="Comercios activos"
                        valor={m.comercios_activos}
                    />
                </dl>
            </section>

            <section aria-label="Últimas solicitudes" className="mt-12">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <h2 className="font-display text-2xl text-texto">
                        Últimas solicitudes
                    </h2>
                    <Link
                        href="/admin/cotizaciones"
                        className="text-sm font-medium text-bordo underline decoration-dorado decoration-2 underline-offset-[6px] transition-colors hover:text-bordo-hover"
                    >
                        Ver la bandeja completa
                    </Link>
                </div>

                <div className="mt-5">
                    {ultimas_solicitudes.length === 0 ? (
                        <EmptyState
                            icon={<ClipboardList className="size-8" />}
                            title="Todavía no entró ninguna solicitud"
                            description="Cuando alguien pida una cotización desde el sitio, va a aparecer acá."
                        />
                    ) : (
                        <Table>
                            <THead>
                                <TR>
                                    <TH>Cliente</TH>
                                    <TH>Localidad</TH>
                                    <TH numeric>Ítems</TH>
                                    <TH>Estado</TH>
                                    <TH>Cotización</TH>
                                    <TH numeric>Recibida</TH>
                                </TR>
                            </THead>
                            <TBody>
                                {ultimas_solicitudes.map((s) => (
                                    <TR key={s.id}>
                                        <TD>
                                            <Link
                                                href={`/admin/cotizaciones/${s.id}`}
                                                className="font-medium text-texto underline-offset-4 hover:text-bordo hover:underline"
                                            >
                                                {s.nombre}
                                            </Link>
                                        </TD>
                                        <TD className="text-texto-medio">
                                            {s.localidad ?? '—'}
                                        </TD>
                                        <TD numeric>{s.items_count}</TD>
                                        <TD>
                                            <StatusBadge
                                                domain="quoteRequest"
                                                estado={s.estado}
                                            />
                                        </TD>
                                        <TD className="font-mono text-xs text-texto-medio">
                                            {s.cotizacion_numero ?? '—'}
                                        </TD>
                                        <TD
                                            numeric
                                            className="text-texto-medio"
                                        >
                                            {shortDate(s.creada_el)}
                                        </TD>
                                    </TR>
                                ))}
                            </TBody>
                        </Table>
                    )}
                </div>
            </section>
        </AdminLayout>
    );
}
