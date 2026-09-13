import { Link } from '@inertiajs/react';
import { ArrowRight, CalendarDays, ClipboardList, Wheat } from 'lucide-react';
import { useState } from 'react';
import {
    StackedField,
    StackedRow,
    StatusBadge,
    Table,
    TBody,
    TD,
    TH,
    THead,
    TR,
} from '@/components/ui';
import { EmptyState } from '@/components/ui/states';
import AdminLayout from '@/layouts/admin-layout';
import type { QuoteRequestEstadoValue } from '@/lib/estados';
import {
    dayMonth,
    money,
    plainDayLabel,
    quantity,
    shortDate,
} from '@/lib/format';
import { cn } from '@/lib/utils';

type Metricas = {
    solicitudes_pendientes: number;
    solicitudes_demoradas: number;
    cotizaciones_borrador: number;
    cotizaciones_enviadas: number;
    cotizaciones_por_vencer: number;
    productos_activos: number;
    productos_sin_foto: number;
    categorias_activas: number;
};

type Mes = {
    solicitudes: number;
    solicitudes_mes_anterior: number;
    mayoristas: number;
    cotizaciones_enviadas: number;
    monto_enviado: string;
    ticket_promedio: string | null;
    respuesta_minutos: number | null;
};

type Dia = { dia: string; total: number };

type Evento = {
    id: number;
    nombre: string;
    tipo_label: string;
    fecha_evento: string;
    dias: number;
    estado: QuoteRequestEstadoValue;
    estado_label: string;
    total: string | null;
};

type MasPedido = {
    id: number;
    nombre: string;
    unidad_label: string;
    solicitudes: number;
    cantidad: string;
    dado_de_baja: boolean;
};

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
    mes: Mes;
    serie_solicitudes: Dia[];
    proximos_eventos: Evento[];
    mas_pedidos: MasPedido[];
    ultimas_solicitudes: Solicitud[];
};

/** `45 min`, `3 h 20 min`, `2 d 4 h`: lo justo para leer de un vistazo. */
function duracion(minutos: number): string {
    if (minutos < 60) {
        return `${minutos} min`;
    }

    const horas = Math.floor(minutos / 60);

    if (horas < 24) {
        const resto = minutos % 60;

        return resto ? `${horas} h ${resto} min` : `${horas} h`;
    }

    const dias = Math.floor(horas / 24);
    const resto = horas % 24;

    return resto ? `${dias} d ${resto} h` : `${dias} d`;
}

function cuando(dias: number): string {
    if (dias === 0) {
        return 'Hoy';
    }

    return dias === 1 ? 'Mañana' : `En ${dias} días`;
}

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
    detalle: React.ReactNode;
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
                <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-medium text-texto-medio transition-colors group-hover:text-bordo">
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
    alerta = false,
}: {
    label: string;
    valor: number;
    href?: string;
    /** Pinta el número en bordó si hay algo para resolver. */
    alerta?: boolean;
}) {
    const contenido = (
        <>
            <dt className="text-sm text-texto-medio">{label}</dt>
            <dd
                className={cn(
                    'mt-1.5 font-mono text-2xl tabular-nums',
                    alerta && valor > 0 ? 'text-bordo' : 'text-texto',
                )}
            >
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

/** Tarjeta de sección de la parte media del tablero. */
function Panel({
    titulo,
    bajada,
    children,
    className,
}: {
    titulo: string;
    bajada: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <section
            className={cn(
                'flex flex-col rounded-xl bg-papel p-6 shadow-xs ring-1 ring-borde',
                className,
            )}
        >
            <h2 className="font-display text-2xl text-texto">{titulo}</h2>
            <p className="mt-1 text-sm text-texto-medio">{bajada}</p>
            {children}
        </section>
    );
}

/** Lo que va del mes, en filas etiqueta / número. */
function EsteMes({ mes }: { mes: Mes }) {
    const diferencia = mes.solicitudes - mes.solicitudes_mes_anterior;

    const comparacion =
        diferencia === 0
            ? `Igual que el mes pasado (${mes.solicitudes_mes_anterior}).`
            : `${diferencia > 0 ? '+' : '−'}${Math.abs(diferencia)} contra el mes pasado (${mes.solicitudes_mes_anterior}).`;

    const filas: { label: string; valor: string; nota: string }[] = [
        {
            label: 'Solicitudes',
            valor: String(mes.solicitudes),
            nota:
                mes.mayoristas > 0
                    ? `${comparacion} ${mes.mayoristas} mayorista${mes.mayoristas === 1 ? '' : 's'}.`
                    : comparacion,
        },
        {
            label: 'Monto cotizado',
            valor: money(mes.monto_enviado),
            nota: `${mes.cotizaciones_enviadas} cotizaci${mes.cotizaciones_enviadas === 1 ? 'ón enviada' : 'ones enviadas'}.`,
        },
        {
            label: 'Ticket promedio',
            valor: mes.ticket_promedio ? money(mes.ticket_promedio) : '—',
            nota: 'Total promedio de cada cotización enviada.',
        },
        {
            label: 'Tiempo de respuesta',
            valor:
                mes.respuesta_minutos === null
                    ? '—'
                    : duracion(mes.respuesta_minutos),
            nota: 'Promedio desde que entra la solicitud hasta que sale la cotización.',
        },
    ];

    return (
        <Panel
            titulo="En lo que va del mes"
            bajada="Comparado con el mismo tramo del mes pasado."
        >
            <dl className="mt-6 grid gap-5">
                {filas.map((fila) => (
                    <div
                        key={fila.label}
                        className="border-t border-borde pt-4 first:border-t-0 first:pt-0"
                    >
                        <div className="flex items-baseline justify-between gap-3">
                            <dt className="text-sm text-texto-medio">
                                {fila.label}
                            </dt>
                            <dd className="font-mono text-xl text-texto tabular-nums">
                                {fila.valor}
                            </dd>
                        </div>
                        <p className="mt-1 text-xs text-texto-suave">
                            {fila.nota}
                        </p>
                    </div>
                ))}
            </dl>
        </Panel>
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

/** Eventos con fecha en las próximas dos semanas, el más cercano arriba. */
function ProximosEventos({ eventos }: { eventos: Evento[] }) {
    return (
        <Panel
            titulo="Próximos eventos"
            bajada="Solicitudes con fecha en las próximas dos semanas."
        >
            {eventos.length === 0 ? (
                <p className="mt-6 flex items-center gap-2 border-t border-borde pt-5 text-sm text-texto-medio">
                    <CalendarDays
                        className="size-4 shrink-0 text-texto-suave"
                        aria-hidden="true"
                    />
                    No hay eventos agendados en estos catorce días.
                </p>
            ) : (
                <ul className="mt-5 divide-y divide-borde">
                    {eventos.map((e) => (
                        <li
                            key={e.id}
                            className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
                        >
                            <div className="min-w-0">
                                <p
                                    className={cn(
                                        'font-mono text-[11px] tracking-[0.12em] uppercase',
                                        e.dias <= 2
                                            ? 'text-bordo'
                                            : 'text-texto-suave',
                                    )}
                                >
                                    {cuando(e.dias)} ·{' '}
                                    {dayMonth(e.fecha_evento)}
                                </p>
                                <Link
                                    href={`/admin/cotizaciones/${e.id}`}
                                    className="mt-0.5 block truncate font-medium text-texto underline-offset-4 hover:text-bordo hover:underline"
                                >
                                    {e.nombre}
                                </Link>
                                <p className="text-xs text-texto-medio">
                                    {e.tipo_label}
                                    {e.total !== null && (
                                        <>
                                            {' · '}
                                            <span className="font-mono">
                                                {money(e.total)}
                                            </span>
                                        </>
                                    )}
                                </p>
                            </div>
                            <StatusBadge
                                domain="quoteRequest"
                                estado={e.estado}
                            />
                        </li>
                    ))}
                </ul>
            )}
        </Panel>
    );
}

/** Ranking de productos por cantidad de solicitudes en que aparecen. */
function MasPedidos({ productos }: { productos: MasPedido[] }) {
    const maximo = Math.max(...productos.map((p) => p.solicitudes), 1);

    return (
        <Panel
            titulo="Lo más pedido"
            bajada="Últimos 30 días, por cantidad de solicitudes."
        >
            {productos.length === 0 ? (
                <p className="mt-6 flex items-center gap-2 border-t border-borde pt-5 text-sm text-texto-medio">
                    <Wheat
                        className="size-4 shrink-0 text-texto-suave"
                        aria-hidden="true"
                    />
                    Todavía no hay pedidos en este período.
                </p>
            ) : (
                <ol className="mt-5 grid gap-4">
                    {productos.map((p) => (
                        <li key={p.id}>
                            <div className="flex items-baseline justify-between gap-3 text-sm">
                                <span className="min-w-0 truncate font-medium text-texto">
                                    {p.nombre}
                                    {p.dado_de_baja && (
                                        <span className="ml-2 text-xs font-normal text-texto-suave">
                                            (dado de baja)
                                        </span>
                                    )}
                                </span>
                                <span className="shrink-0 font-mono text-texto tabular-nums">
                                    {p.solicitudes}
                                </span>
                            </div>
                            <div
                                className="mt-1.5 h-1.5 rounded-full bg-crema"
                                aria-hidden="true"
                            >
                                <div
                                    className="h-full rounded-full bg-dorado-hover"
                                    style={{
                                        width: `${Math.round((p.solicitudes / maximo) * 100)}%`,
                                    }}
                                />
                            </div>
                            <p className="mt-1 text-xs text-texto-suave">
                                Total pedido: {quantity(p.cantidad)} ·{' '}
                                {p.unidad_label}
                            </p>
                        </li>
                    ))}
                </ol>
            )}
        </Panel>
    );
}

export default function AdminDashboard({
    metricas: m,
    mes,
    serie_solicitudes,
    proximos_eventos,
    mas_pedidos,
    ultimas_solicitudes,
}: Props) {
    return (
        <AdminLayout
            eyebrow="Administración"
            title="Dashboard"
            description="Qué está esperando una respuesta de la panadería, y cómo viene el mes."
        >
            <section aria-label="Pendientes">
                <div className="grid gap-5 sm:grid-cols-3">
                    <Pendiente
                        label="Solicitudes pendientes"
                        valor={m.solicitudes_pendientes}
                        detalle={
                            m.solicitudes_demoradas > 0 ? (
                                <>
                                    <span className="font-medium text-bordo">
                                        {m.solicitudes_demoradas}{' '}
                                        {m.solicitudes_demoradas === 1
                                            ? 'lleva'
                                            : 'llevan'}{' '}
                                        más de 2 días
                                    </span>{' '}
                                    sin respuesta.
                                </>
                            ) : (
                                'Entraron por el sitio y todavía no se respondieron.'
                            )
                        }
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

            <section
                aria-label="Actividad"
                className="mt-8 grid gap-5 lg:grid-cols-[1.5fr_1fr]"
            >
                <Actividad serie={serie_solicitudes} />
                <EsteMes mes={mes} />
            </section>

            <section
                aria-label="Eventos y productos"
                className="mt-5 grid gap-5 lg:grid-cols-2"
            >
                <ProximosEventos eventos={proximos_eventos} />
                <MasPedidos productos={mas_pedidos} />
            </section>

            <section aria-label="Catálogo" className="mt-12">
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
                        label="Productos sin foto"
                        valor={m.productos_sin_foto}
                        href="/admin/productos"
                        alerta
                    />
                    <Dato
                        label="Categorías activas"
                        valor={m.categorias_activas}
                        href="/admin/categorias"
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
                        <>
                            <ul className="grid gap-3 sm:hidden">
                                {ultimas_solicitudes.map((s) => (
                                    <li key={s.id}>
                                        <StackedRow>
                                            <div className="flex items-start justify-between gap-3">
                                                <Link
                                                    href={`/admin/cotizaciones/${s.id}`}
                                                    className="min-w-0 font-medium text-texto underline-offset-4 hover:text-bordo hover:underline"
                                                >
                                                    {s.nombre}
                                                </Link>
                                                <StatusBadge
                                                    domain="quoteRequest"
                                                    estado={s.estado}
                                                />
                                            </div>
                                            <div className="mt-3 border-t border-borde pt-2">
                                                <StackedField
                                                    label="Localidad"
                                                    value={s.localidad ?? '—'}
                                                />
                                                <StackedField
                                                    label="Ítems"
                                                    value={s.items_count}
                                                    numeric
                                                />
                                                <StackedField
                                                    label="Cotización"
                                                    value={
                                                        s.cotizacion_numero ??
                                                        '—'
                                                    }
                                                    numeric
                                                />
                                                <StackedField
                                                    label="Recibida"
                                                    value={shortDate(
                                                        s.creada_el,
                                                    )}
                                                    numeric
                                                />
                                            </div>
                                        </StackedRow>
                                    </li>
                                ))}
                            </ul>

                            <Table containerClassName="hidden sm:block">
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
                        </>
                    )}
                </div>
            </section>
        </AdminLayout>
    );
}
