import { Link } from '@inertiajs/react';
import { ClipboardList } from 'lucide-react';
import { StatusBadge, Table, TBody, TD, TH, THead, TR } from '@/components/ui';
import { EmptyState } from '@/components/ui/states';
import AdminLayout from '@/layouts/admin-layout';
import type { QuoteRequestEstadoValue } from '@/lib/estados';
import { shortDate } from '@/lib/format';
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
    ultimas_solicitudes: Solicitud[];
};

/** Una tarjeta de métrica; si tiene `href`, lleva a la sección que la resuelve. */
function Metrica({
    label,
    valor,
    href,
    destacado = false,
}: {
    label: string;
    valor: number;
    href?: string;
    destacado?: boolean;
}) {
    const contenido = (
        <>
            <p className="text-sm text-texto-medio">{label}</p>
            <p
                className={cn(
                    'mt-1 font-mono text-3xl tabular-nums',
                    destacado && valor > 0 ? 'text-bordo' : 'text-texto',
                )}
            >
                {valor}
            </p>
        </>
    );

    const clase =
        'block rounded-lg border border-borde bg-papel px-4 py-3 transition-colors';

    return href ? (
        <Link href={href} className={cn(clase, 'hover:border-dorado')}>
            {contenido}
        </Link>
    ) : (
        <div className={clase}>{contenido}</div>
    );
}

/** Las tarjetas del tablero, en orden. `destacado` pinta el número si es > 0. */
function tarjetas(m: Metricas) {
    return [
        {
            label: 'Solicitudes pendientes',
            valor: m.solicitudes_pendientes,
            href: '/admin/cotizaciones?estado=pendientes',
            destacado: true,
        },
        {
            label: 'Cotizaciones borrador',
            valor: m.cotizaciones_borrador,
            href: '/admin/cotizaciones',
        },
        {
            label: 'Cotizaciones enviadas',
            valor: m.cotizaciones_enviadas,
            href: '/admin/cotizaciones',
        },
        {
            label: 'Por vencer (7 días)',
            valor: m.cotizaciones_por_vencer,
            destacado: true,
        },
        {
            label: 'Productos activos',
            valor: m.productos_activos,
            href: '/admin/productos?estado=activo',
        },
        {
            label: 'Categorías activas',
            valor: m.categorias_activas,
            href: '/admin/categorias',
        },
        { label: 'Comercios activos', valor: m.comercios_activos },
        {
            label: 'Comercios pendientes',
            valor: m.comercios_pendientes,
            destacado: true,
        },
    ];
}

export default function AdminDashboard({
    metricas,
    ultimas_solicitudes,
}: Props) {
    return (
        <AdminLayout
            title="Panel"
            description="Qué está esperando una respuesta de la panadería."
        >
            <section aria-label="Métricas">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {tarjetas(metricas).map((t) => (
                        <Metrica key={t.label} {...t} />
                    ))}
                </div>
            </section>

            <section aria-label="Últimas solicitudes" className="mt-10">
                <h2 className="mb-3 font-display text-xl text-texto">
                    Últimas solicitudes
                </h2>

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
                                    <TD numeric className="text-texto-medio">
                                        {shortDate(s.creada_el)}
                                    </TD>
                                </TR>
                            ))}
                        </TBody>
                    </Table>
                )}
            </section>
        </AdminLayout>
    );
}
