import { Link, router } from '@inertiajs/react';
import { FileText, MessageCircle } from 'lucide-react';
import {
    Badge,
    Button,
    Pagination,
    SearchInput,
    Select,
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
import { useTableFilters } from '@/hooks/use-table-filters';
import AdminLayout from '@/layouts/admin-layout';
import type { QuoteEstadoValue, QuoteRequestEstadoValue } from '@/lib/estados';
import { money, shortDate } from '@/lib/format';
import type { Paginated } from '@/types';

type Solicitud = {
    id: number;
    nombre: string;
    telefono: string;
    tipo: 'minorista' | 'mayorista';
    tipo_label: string;
    localidad: string | null;
    fecha_evento: string | null;
    estado: QuoteRequestEstadoValue;
    estado_label: string;
    items_count: number;
    creada_el: string | null;
    cotizacion: {
        id: number;
        numero: string;
        estado: QuoteEstadoValue;
        total: string;
        editable: boolean;
    } | null;
    /** Enlace wa.me hacia el cliente con la cotización precargada, o null. */
    whatsapp_cliente: string | null;
};

type Filtros = { estado: string | null; q: string | null };

type Props = {
    solicitudes: Paginated<Solicitud>;
    estados: { value: string; label: string }[];
    filtros: Filtros;
};

export default function CotizacionesIndex({
    solicitudes,
    estados,
    filtros,
}: Props) {
    const { q, setQ, navegar } = useTableFilters(
        '/admin/cotizaciones',
        filtros,
    );

    /**
     * Abrir WhatsApp con la cotización escrita es responderle al cliente, así que
     * la cotización queda enviada. La ventana se abre primero y en el mismo clic:
     * si esperara a la respuesta del servidor, el navegador lo tomaría por popup.
     */
    const responder = (solicitud: Solicitud) => {
        if (!solicitud.whatsapp_cliente) {
            return;
        }

        window.open(solicitud.whatsapp_cliente, '_blank', 'noopener');

        if (solicitud.cotizacion?.editable) {
            router.post(
                `/admin/cotizaciones/${solicitud.cotizacion.id}/enviar`,
                {},
                { preserveScroll: true },
            );
        }
    };

    // Tabla y tarjetas muestran lo mismo: estas piezas no se escriben dos veces.
    const cotizacionDe = (s: Solicitud) =>
        s.cotizacion ? (
            <span className="inline-flex items-center gap-2">
                <span className="font-mono text-xs text-texto-medio">
                    {s.cotizacion.numero}
                </span>
                <StatusBadge domain="quote" estado={s.cotizacion.estado} />
            </span>
        ) : (
            <Badge tone="neutro">Sin cotizar</Badge>
        );

    const accionesDe = (s: Solicitud) => (
        <div className="flex items-center gap-1">
            {s.whatsapp_cliente && (
                <Button
                    variant="quiet"
                    size="sm"
                    onClick={() => responder(s)}
                    title={
                        s.cotizacion?.editable
                            ? `Responder a ${s.nombre} por WhatsApp y dar la cotización por enviada`
                            : `Responder a ${s.nombre} por WhatsApp`
                    }
                    icon={
                        <MessageCircle className="size-4" aria-hidden="true" />
                    }
                >
                    Responder
                </Button>
            )}
            <Link href={`/admin/cotizaciones/${s.id}`}>
                <Button
                    variant="quiet"
                    size="sm"
                    aria-label={`Ver la solicitud de ${s.nombre}`}
                >
                    Ver
                </Button>
            </Link>
        </div>
    );

    return (
        <AdminLayout
            eyebrow="Bandeja"
            title="Cotizaciones"
            description="Las solicitudes que entran desde el sitio y su cotización."
        >
            <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                <SearchInput
                    label="Buscar solicitudes"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Buscar por nombre o teléfono…"
                />

                <Select
                    label="Estado"
                    className="sm:w-52"
                    placeholder="Todas"
                    value={filtros.estado ?? ''}
                    options={[
                        { value: 'pendientes', label: 'Sólo pendientes' },
                        ...estados,
                    ]}
                    onChange={(e) => navegar({ estado: e.target.value })}
                />
            </div>

            {solicitudes.data.length === 0 ? (
                <EmptyState
                    icon={<FileText className="size-8" />}
                    title="No hay solicitudes para mostrar"
                    description="Cuando entre un pedido de cotización desde el sitio, va a aparecer acá."
                />
            ) : (
                <div className="grid gap-4">
                    <ul className="grid gap-3 sm:hidden">
                        {solicitudes.data.map((s) => (
                            <li key={s.id}>
                                <StackedRow>
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Link
                                                    href={`/admin/cotizaciones/${s.id}`}
                                                    className="font-medium text-texto underline-offset-4 hover:text-bordo hover:underline"
                                                >
                                                    {s.nombre}
                                                </Link>
                                                {s.tipo === 'mayorista' && (
                                                    <Badge tone="info">
                                                        {s.tipo_label}
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-texto-suave">
                                                {s.localidad ?? s.telefono}
                                            </p>
                                        </div>
                                        <StatusBadge
                                            domain="quoteRequest"
                                            estado={s.estado}
                                        />
                                    </div>
                                    <div className="mt-3 border-t border-borde pt-2">
                                        <StackedField
                                            label="Evento"
                                            value={shortDate(s.fecha_evento)}
                                        />
                                        <StackedField
                                            label="Ítems"
                                            value={s.items_count}
                                            numeric
                                        />
                                        <StackedField
                                            label="Cotización"
                                            value={cotizacionDe(s)}
                                        />
                                        <StackedField
                                            label="Total"
                                            value={
                                                s.cotizacion
                                                    ? money(s.cotizacion.total)
                                                    : '—'
                                            }
                                            numeric
                                        />
                                        <StackedField
                                            label="Recibida"
                                            value={shortDate(s.creada_el)}
                                            numeric
                                        />
                                    </div>
                                    <div className="mt-2 flex justify-end">
                                        {accionesDe(s)}
                                    </div>
                                </StackedRow>
                            </li>
                        ))}
                    </ul>

                    <Table containerClassName="hidden sm:block">
                        <THead>
                            <TR>
                                <TH>Cliente</TH>
                                <TH>Evento</TH>
                                <TH numeric>Ítems</TH>
                                <TH>Estado</TH>
                                <TH>Cotización</TH>
                                <TH numeric>Total</TH>
                                <TH numeric>Recibida</TH>
                                <TH>Acciones</TH>
                            </TR>
                        </THead>
                        <TBody>
                            {solicitudes.data.map((s) => (
                                <TR key={s.id}>
                                    <TD>
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/admin/cotizaciones/${s.id}`}
                                                className="font-medium text-texto underline-offset-4 hover:text-bordo hover:underline"
                                            >
                                                {s.nombre}
                                            </Link>
                                            {s.tipo === 'mayorista' && (
                                                <Badge tone="info">
                                                    {s.tipo_label}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-texto-suave">
                                            {s.localidad ?? s.telefono}
                                        </p>
                                    </TD>
                                    <TD className="text-texto-medio">
                                        {shortDate(s.fecha_evento)}
                                    </TD>
                                    <TD numeric>{s.items_count}</TD>
                                    <TD>
                                        <StatusBadge
                                            domain="quoteRequest"
                                            estado={s.estado}
                                        />
                                    </TD>
                                    <TD>{cotizacionDe(s)}</TD>
                                    <TD numeric>
                                        {s.cotizacion ? (
                                            <span className="font-mono text-texto">
                                                {money(s.cotizacion.total)}
                                            </span>
                                        ) : (
                                            <span className="text-texto-suave">
                                                —
                                            </span>
                                        )}
                                    </TD>
                                    <TD numeric className="text-texto-medio">
                                        {shortDate(s.creada_el)}
                                    </TD>
                                    <TD>{accionesDe(s)}</TD>
                                </TR>
                            ))}
                        </TBody>
                    </Table>

                    <Pagination meta={solicitudes} />
                </div>
            )}
        </AdminLayout>
    );
}
