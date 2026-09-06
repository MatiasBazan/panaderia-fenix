import { Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Download,
    FileText,
    MessageCircle,
    Plus,
    Send,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import {
    Badge,
    Button,
    DatePicker,
    Input,
    Modal,
    Select,
    StatusBadge,
    Table,
    TBody,
    TD,
    TH,
    THead,
    TR,
} from '@/components/ui';
import { Textarea } from '@/components/ui/input';
import AdminLayout from '@/layouts/admin-layout';
import type { QuoteEstadoValue, QuoteRequestEstadoValue } from '@/lib/estados';
import { money, quantity, shortDate } from '@/lib/format';

type SolicitudItem = {
    id: number;
    product_id: number;
    nombre: string;
    variante: string | null;
    unidad_label: string;
    precio_base: string;
    dado_de_baja: boolean;
    cantidad: string;
    nota: string | null;
};

type Solicitud = {
    id: number;
    nombre: string;
    telefono: string;
    tipo_label: string;
    localidad: string | null;
    mensaje: string | null;
    fecha_evento: string | null;
    estado: QuoteRequestEstadoValue;
    estado_label: string;
    ip: string | null;
    creada_el: string | null;
    items: SolicitudItem[];
};

type CotizacionItem = {
    id: number;
    product_id: number | null;
    descripcion: string;
    cantidad: string;
    precio_unitario: string;
    subtotal: string;
};

type Cotizacion = {
    id: number;
    numero: string;
    subtotal: string;
    descuento: string;
    total: string;
    vence_el: string;
    vencida: boolean;
    observaciones: string | null;
    estado: QuoteEstadoValue;
    estado_label: string;
    editable: boolean;
    enviada_el: string | null;
    creada_por: string | null;
    items: CotizacionItem[];
};

type Props = {
    solicitud: Solicitud;
    cotizacion: Cotizacion | null;
    estados: { value: string; label: string }[];
    puede_generar: boolean;
    /** Enlace wa.me hacia el cliente con la cotización precargada, o null. */
    whatsapp_cliente: string | null;
};

type ItemForm = {
    product_id: number | null;
    descripcion: string;
    cantidad: string;
    precio_unitario: string;
};

export default function CotizacionShow({
    solicitud,
    cotizacion,
    estados,
    puede_generar,
    whatsapp_cliente,
}: Props) {
    const [confirmarEnvio, setConfirmarEnvio] = useState(false);

    const cambiarEstado = (estado: string) => {
        router.patch(
            `/admin/cotizaciones/${solicitud.id}/estado`,
            { estado },
            { preserveScroll: true },
        );
    };

    const generar = () => {
        router.post(
            `/admin/cotizaciones/${solicitud.id}/generar`,
            {},
            { preserveScroll: true },
        );
    };

    return (
        <AdminLayout
            eyebrow="Solicitud"
            title={solicitud.nombre}
            description={`Solicitud recibida el ${shortDate(solicitud.creada_el)}`}
            actions={
                <Link
                    href="/admin/cotizaciones"
                    className="inline-flex items-center gap-1.5 text-sm text-texto-medio hover:text-texto"
                >
                    <ArrowLeft className="size-4" aria-hidden="true" />
                    Volver a cotizaciones
                </Link>
            }
        >
            <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
                {/* Columna izquierda: la solicitud tal como entró */}
                <div className="grid gap-6">
                    <section className="rounded-xl bg-papel p-6 shadow-xs ring-1 ring-borde">
                        <div className="flex items-center justify-between gap-3">
                            <h2 className="font-display text-xl text-texto">
                                Datos del cliente
                            </h2>
                            <StatusBadge
                                domain="quoteRequest"
                                estado={solicitud.estado}
                            />
                        </div>

                        <dl className="mt-4 grid gap-2 text-sm">
                            <Dato label="Tipo de pedido">
                                {solicitud.tipo_label}
                            </Dato>
                            <Dato label="Teléfono">
                                <span className="font-mono">
                                    {solicitud.telefono}
                                </span>
                            </Dato>
                            <Dato label="Localidad">
                                {solicitud.localidad ?? '—'}
                            </Dato>
                            <Dato label="Fecha del evento">
                                {shortDate(solicitud.fecha_evento)}
                            </Dato>
                        </dl>

                        {solicitud.mensaje && (
                            <p className="mt-4 rounded-md border border-borde bg-crema px-3 py-2 text-sm text-texto-medio">
                                {solicitud.mensaje}
                            </p>
                        )}

                        <div className="mt-5 border-t border-borde pt-4">
                            <Select
                                label="Estado de la solicitud"
                                value={solicitud.estado}
                                // «Cotizada» lo pone el envío de la cotización, no
                                // se elige a mano (el backend lo rechaza).
                                options={estados.map((e) => ({
                                    ...e,
                                    disabled: e.value === 'cotizada',
                                }))}
                                onChange={(e) => cambiarEstado(e.target.value)}
                            />
                        </div>
                    </section>

                    <section className="rounded-xl bg-papel p-6 shadow-xs ring-1 ring-borde">
                        <h2 className="font-display text-xl text-texto">
                            Productos pedidos
                        </h2>
                        <ul className="mt-3 divide-y divide-borde">
                            {solicitud.items.map((item) => (
                                <li
                                    key={item.id}
                                    className="flex items-start justify-between gap-3 py-2.5 text-sm"
                                >
                                    <div>
                                        <p className="font-medium text-texto">
                                            {item.nombre}
                                            {item.variante && (
                                                <span className="ml-2 text-xs font-normal text-bordo">
                                                    {item.variante}
                                                </span>
                                            )}
                                            {item.dado_de_baja && (
                                                <span className="ml-2 text-xs text-texto-suave">
                                                    (dado de baja)
                                                </span>
                                            )}
                                        </p>
                                        {item.nota && (
                                            <p className="text-xs text-texto-medio">
                                                {item.nota}
                                            </p>
                                        )}
                                        <p className="text-xs text-texto-suave">
                                            {item.unidad_label} ·{' '}
                                            {money(item.precio_base)} base
                                        </p>
                                    </div>
                                    <span className="shrink-0 font-mono text-texto">
                                        {quantity(item.cantidad)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>

                {/* Columna derecha: la cotización */}
                <div>
                    {cotizacion ? (
                        <CotizacionPanel
                            cotizacion={cotizacion}
                            telefono={solicitud.telefono}
                            whatsappCliente={whatsapp_cliente}
                            onEnviar={() => setConfirmarEnvio(true)}
                        />
                    ) : (
                        <section className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed border-borde bg-papel px-6 py-12 text-center">
                            <FileText
                                className="size-8 text-texto-suave"
                                aria-hidden="true"
                            />
                            <p className="mt-4 font-display text-xl text-texto">
                                Todavía no hay cotización
                            </p>
                            <p className="mt-1.5 max-w-sm text-sm text-texto-medio">
                                Generá un borrador a partir de los productos
                                pedidos. Después vas a poder ajustar precios,
                                descuento y vigencia.
                            </p>
                            {puede_generar ? (
                                <Button
                                    className="mt-5"
                                    icon={<Plus className="size-4" />}
                                    onClick={generar}
                                >
                                    Generar cotización
                                </Button>
                            ) : (
                                <p className="mt-5 text-sm text-texto-suave">
                                    Esta solicitud no admite generar una
                                    cotización nueva.
                                </p>
                            )}
                        </section>
                    )}
                </div>
            </div>

            {cotizacion && (
                <Modal
                    open={confirmarEnvio}
                    onClose={() => setConfirmarEnvio(false)}
                    title="Enviar la cotización"
                    description={`Se marca ${cotizacion.numero} como enviada y ya no se va a poder editar.`}
                    footer={
                        <>
                            <Button
                                variant="secondary"
                                onClick={() => setConfirmarEnvio(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                icon={<Send className="size-4" />}
                                onClick={() => {
                                    router.post(
                                        `/admin/cotizaciones/${cotizacion.id}/enviar`,
                                        {},
                                        {
                                            preserveScroll: true,
                                            onFinish: () =>
                                                setConfirmarEnvio(false),
                                        },
                                    );
                                }}
                            >
                                Enviar ahora
                            </Button>
                        </>
                    }
                />
            )}
        </AdminLayout>
    );
}

function Dato({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex items-baseline justify-between gap-3">
            <dt className="text-texto-medio">{label}</dt>
            <dd className="text-right text-texto">{children}</dd>
        </div>
    );
}

/** Panel de la cotización: borrador editable o vista de sólo lectura. */
function CotizacionPanel({
    cotizacion,
    telefono,
    whatsappCliente,
    onEnviar,
}: {
    cotizacion: Cotizacion;
    telefono: string;
    whatsappCliente: string | null;
    onEnviar: () => void;
}) {
    const form = useForm<{
        vence_el: string;
        observaciones: string;
        descuento: string;
        items: ItemForm[];
    }>({
        vence_el: cotizacion.vence_el,
        observaciones: cotizacion.observaciones ?? '',
        descuento: cotizacion.descuento,
        items: cotizacion.items.map((it) => ({
            product_id: it.product_id,
            descripcion: it.descripcion,
            cantidad: it.cantidad,
            precio_unitario: it.precio_unitario,
        })),
    });

    const errores = form.errors as Record<string, string>;

    const setItem = (i: number, campo: keyof ItemForm, valor: string) => {
        const items = form.data.items.slice();
        items[i] = { ...items[i], [campo]: valor };
        form.setData('items', items);
    };

    const agregarItem = () => {
        form.setData('items', [
            ...form.data.items,
            {
                product_id: null,
                descripcion: '',
                cantidad: '1',
                precio_unitario: '0.00',
            },
        ]);
    };

    const quitarItem = (i: number) => {
        form.setData(
            'items',
            form.data.items.filter((_, idx) => idx !== i),
        );
    };

    const subtotal = form.data.items.reduce(
        (acc, it) =>
            acc + Number(it.cantidad || 0) * Number(it.precio_unitario || 0),
        0,
    );
    const total = Math.max(0, subtotal - Number(form.data.descuento || 0));

    const guardar = (e: React.FormEvent) => {
        e.preventDefault();
        form.put(`/admin/cotizaciones/${cotizacion.id}`, {
            preserveScroll: true,
            // Tras guardar, lo actual pasa a ser el nuevo "limpio": así el botón
            // de enviar (deshabilitado si hay cambios sin guardar) se libera.
            onSuccess: () => form.setDefaults(),
        });
    };

    /**
     * Responder por WhatsApp es enviar la cotización: se abre el chat con el
     * mensaje escrito y el borrador queda cerrado. La ventana se abre primero y
     * en el mismo clic, si no el navegador lo toma por popup.
     */
    const responder = () => {
        if (!whatsappCliente) {
            return;
        }

        window.open(whatsappCliente, '_blank', 'noopener');

        if (cotizacion.editable) {
            router.post(
                `/admin/cotizaciones/${cotizacion.id}/enviar`,
                {},
                { preserveScroll: true },
            );
        }
    };

    return (
        <section className="rounded-xl bg-papel p-6 shadow-xs ring-1 ring-borde">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <h2 className="font-display text-xl text-texto">
                        Cotización{' '}
                        <span className="font-mono text-base">
                            {cotizacion.numero}
                        </span>
                    </h2>
                    <StatusBadge domain="quote" estado={cotizacion.estado} />
                    {cotizacion.vencida && <Badge tone="error">Vencida</Badge>}
                </div>
                <a
                    href={`/admin/cotizaciones/${cotizacion.id}/pdf`}
                    className="inline-flex items-center gap-1.5 text-sm text-texto-medio hover:text-texto"
                >
                    <Download className="size-4" aria-hidden="true" />
                    PDF
                </a>
            </div>

            {whatsappCliente && (
                <>
                    <button
                        type="button"
                        onClick={responder}
                        disabled={form.isDirty}
                        title={
                            form.isDirty
                                ? 'Guardá los cambios: el mensaje se arma con lo que está guardado.'
                                : undefined
                        }
                        className="mt-3 flex w-full items-center justify-between gap-3 rounded-md border border-exito/40 bg-exito/5 px-3 py-2 text-left transition-colors hover:bg-exito/10 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:bg-exito/5"
                    >
                        <span className="flex items-center gap-2 text-sm font-medium text-texto">
                            <MessageCircle
                                className="size-4 shrink-0 text-exito"
                                aria-hidden="true"
                            />
                            Responder al cliente por WhatsApp
                        </span>
                        <span className="font-mono text-xs text-texto-medio">
                            {telefono}
                        </span>
                    </button>

                    {cotizacion.editable && (
                        <p className="mt-1.5 text-xs text-texto-suave">
                            Al responder, la cotización queda marcada como
                            enviada y deja de editarse.
                        </p>
                    )}
                </>
            )}

            {cotizacion.creada_por && (
                <p className="mt-1 text-xs text-texto-suave">
                    Creada por {cotizacion.creada_por}
                    {cotizacion.enviada_el &&
                        ` · enviada el ${shortDate(cotizacion.enviada_el)}`}
                </p>
            )}

            {cotizacion.editable ? (
                <form onSubmit={guardar} className="mt-5 grid gap-4">
                    <div className="grid gap-3">
                        {form.data.items.map((item, i) => (
                            <div
                                key={i}
                                className="grid gap-2 rounded-md border border-borde bg-crema/40 p-3 sm:grid-cols-[1fr_5rem_7rem_auto] sm:items-end"
                            >
                                <Input
                                    label="Descripción"
                                    value={item.descripcion}
                                    error={errores[`items.${i}.descripcion`]}
                                    onChange={(e) =>
                                        setItem(
                                            i,
                                            'descripcion',
                                            e.target.value,
                                        )
                                    }
                                />
                                <Input
                                    label="Cant."
                                    mono
                                    type="number"
                                    step="0.01"
                                    min={0}
                                    value={item.cantidad}
                                    error={errores[`items.${i}.cantidad`]}
                                    onChange={(e) =>
                                        setItem(i, 'cantidad', e.target.value)
                                    }
                                />
                                <Input
                                    label="Precio unit."
                                    mono
                                    type="number"
                                    step="0.01"
                                    min={0}
                                    value={item.precio_unitario}
                                    error={
                                        errores[`items.${i}.precio_unitario`]
                                    }
                                    onChange={(e) =>
                                        setItem(
                                            i,
                                            'precio_unitario',
                                            e.target.value,
                                        )
                                    }
                                />
                                <Button
                                    type="button"
                                    variant="quiet"
                                    size="md"
                                    icon={<Trash2 className="size-4" />}
                                    disabled={form.data.items.length === 1}
                                    onClick={() => quitarItem(i)}
                                >
                                    <span className="sr-only">Quitar ítem</span>
                                </Button>
                            </div>
                        ))}

                        <div>
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                icon={<Plus className="size-4" />}
                                onClick={agregarItem}
                            >
                                Agregar ítem
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Input
                            label="Descuento"
                            mono
                            type="number"
                            step="0.01"
                            min={0}
                            value={form.data.descuento}
                            error={form.errors.descuento}
                            onChange={(e) =>
                                form.setData('descuento', e.target.value)
                            }
                        />
                        <DatePicker
                            label="Vence el"
                            required
                            value={form.data.vence_el}
                            error={form.errors.vence_el}
                            onChange={(valor) =>
                                form.setData('vence_el', valor)
                            }
                        />
                    </div>

                    <Textarea
                        label="Observaciones"
                        rows={2}
                        value={form.data.observaciones}
                        error={form.errors.observaciones}
                        onChange={(e) =>
                            form.setData('observaciones', e.target.value)
                        }
                    />

                    <Totales
                        subtotal={subtotal}
                        descuento={Number(form.data.descuento || 0)}
                        total={total}
                    />

                    <div className="flex flex-wrap items-center gap-2 border-t border-borde pt-4">
                        <Button type="submit" loading={form.processing}>
                            Guardar borrador
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            icon={<Send className="size-4" />}
                            onClick={onEnviar}
                            disabled={form.isDirty}
                            title={
                                form.isDirty
                                    ? 'Guardá los cambios antes de enviar.'
                                    : undefined
                            }
                        >
                            Enviar al cliente
                        </Button>
                    </div>
                </form>
            ) : (
                <div className="mt-5">
                    <Table>
                        <THead>
                            <TR>
                                <TH>Descripción</TH>
                                <TH numeric>Cant.</TH>
                                <TH numeric>Precio</TH>
                                <TH numeric>Subtotal</TH>
                            </TR>
                        </THead>
                        <TBody>
                            {cotizacion.items.map((it) => (
                                <TR key={it.id}>
                                    <TD>{it.descripcion}</TD>
                                    <TD numeric>{quantity(it.cantidad)}</TD>
                                    <TD numeric>{money(it.precio_unitario)}</TD>
                                    <TD numeric>{money(it.subtotal)}</TD>
                                </TR>
                            ))}
                        </TBody>
                    </Table>

                    {cotizacion.observaciones && (
                        <p className="mt-4 text-sm text-texto-medio">
                            {cotizacion.observaciones}
                        </p>
                    )}

                    <div className="mt-4">
                        <Totales
                            subtotal={Number(cotizacion.subtotal)}
                            descuento={Number(cotizacion.descuento)}
                            total={Number(cotizacion.total)}
                        />
                    </div>

                    <p className="mt-4 text-sm text-texto-medio">
                        Vence el {shortDate(cotizacion.vence_el)}.
                    </p>
                </div>
            )}
        </section>
    );
}

function Totales({
    subtotal,
    descuento,
    total,
}: {
    subtotal: number;
    descuento: number;
    total: number;
}) {
    return (
        <dl className="grid gap-1 rounded-md border border-borde bg-crema/50 px-4 py-3 text-sm">
            <div className="flex justify-between">
                <dt className="text-texto-medio">Subtotal</dt>
                <dd className="font-mono text-texto tabular-nums">
                    {money(subtotal)}
                </dd>
            </div>
            {descuento > 0 && (
                <div className="flex justify-between">
                    <dt className="text-texto-medio">Descuento</dt>
                    <dd className="font-mono text-bordo tabular-nums">
                        − {money(descuento)}
                    </dd>
                </div>
            )}
            <div className="flex justify-between border-t border-borde pt-1">
                <dt className="font-medium text-texto">Total</dt>
                <dd className="font-mono text-base font-medium text-texto tabular-nums">
                    {money(total)}
                </dd>
            </div>
        </dl>
    );
}
