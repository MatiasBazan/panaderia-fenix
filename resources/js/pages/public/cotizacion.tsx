import { Head, Link, useForm } from '@inertiajs/react';
import { ClipboardList, Trash2, TriangleAlert } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import {
    Button,
    EmptyState,
    Input,
    QuantityInput,
    Select,
    Textarea,
    UnitBadge,
} from '@/components/ui';
import type { PublicProduct } from '@/components/ui';
import useCotizacion from '@/hooks/use-cotizacion';
import PublicLayout from '@/layouts/public-layout';

type Props = {
    /** Productos todavía activos, entre los que el visitante venía trayendo. */
    productos: PublicProduct[];
    zonas: string[];
};

type FormData = {
    nombre: string;
    email: string;
    telefono: string;
    localidad: string;
    fecha_evento: string;
    mensaje: string;
    sitio_web: string;
    items: { product_id: number; cantidad: number; nota: string }[];
};

export default function Cotizacion({ productos, zonas }: Props) {
    const { items, actualizar, quitar, vaciar } = useCotizacion();

    const vigentes = useMemo(
        () => new Set(productos.map((p) => p.id)),
        [productos],
    );
    const dadosDeBaja = useMemo(
        () => items.filter((item) => !vigentes.has(item.id)),
        [items, vigentes],
    );
    const disponibles = useMemo(
        () => items.filter((item) => vigentes.has(item.id)),
        [items, vigentes],
    );

    const form = useForm<FormData>({
        nombre: '',
        email: '',
        telefono: '',
        localidad: '',
        fecha_evento: '',
        mensaje: '',
        sitio_web: '',
        items: [],
    });

    // El listado de ítems se sincroniza desde el almacenamiento local.
    useEffect(() => {
        form.setData(
            'items',
            disponibles.map((item) => ({
                product_id: item.id,
                cantidad: item.cantidad,
                nota: item.nota ?? '',
            })),
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [disponibles]);

    const enviar = (event: React.FormEvent) => {
        event.preventDefault();
        form.post('/cotizacion', {
            preserveScroll: true,
            onSuccess: () => vaciar(),
        });
    };

    if (items.length === 0) {
        return (
            <PublicLayout hideQuoteBar>
                <Head title="Pedir cotización" />
                <div className="mx-auto max-w-3xl px-4 py-16">
                    <EmptyState
                        title="Tu lista está vacía"
                        description="Recorré el catálogo y agregá los productos que te interesan. Después completás tus datos y te pasamos el presupuesto."
                        icon={<ClipboardList className="size-8" />}
                        action={
                            <Link href="/productos">
                                <Button>Ver el catálogo</Button>
                            </Link>
                        }
                    />
                </div>
            </PublicLayout>
        );
    }

    return (
        <PublicLayout hideQuoteBar>
            <Head title="Pedir cotización" />

            <form onSubmit={enviar} className="mx-auto max-w-3xl px-4 py-10">
                <h1 className="font-display text-4xl text-texto">
                    Pedir cotización
                </h1>
                <p className="mt-2 text-texto-medio">
                    Revisá la lista, dejanos tus datos y te respondemos con
                    precios dentro de las 24 horas hábiles.
                </p>

                {dadosDeBaja.length > 0 && (
                    <div className="mt-6 flex items-start gap-2.5 rounded-lg border border-alerta/40 bg-alerta/8 px-4 py-3">
                        <TriangleAlert
                            className="mt-0.5 size-4 shrink-0 text-alerta"
                            aria-hidden="true"
                        />
                        <div className="text-sm">
                            <p className="font-medium text-texto">
                                Sacamos {dadosDeBaja.length}{' '}
                                {dadosDeBaja.length === 1
                                    ? 'producto'
                                    : 'productos'}{' '}
                                de tu lista
                            </p>
                            <p className="mt-0.5 text-texto-medio">
                                Ya no{' '}
                                {dadosDeBaja.length === 1 ? 'está' : 'están'}{' '}
                                disponible
                                {dadosDeBaja.length === 1 ? '' : 's'}:{' '}
                                {dadosDeBaja
                                    .map((item) => item.nombre)
                                    .join(', ')}
                                .
                            </p>
                            <button
                                type="button"
                                onClick={() =>
                                    dadosDeBaja.forEach((item) =>
                                        quitar(item.id),
                                    )
                                }
                                className="mt-1.5 text-texto underline underline-offset-4 hover:text-bordo"
                            >
                                Entendido, quitarlos
                            </button>
                        </div>
                    </div>
                )}

                {/* Lista */}
                <section className="mt-8">
                    <h2 className="font-display text-2xl text-texto">
                        Tu lista
                    </h2>

                    <ul className="mt-4 grid gap-3">
                        {disponibles.map((item) => (
                            <li
                                key={item.id}
                                className="rounded-lg border border-borde bg-papel p-4"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <p className="font-medium text-texto">
                                            {item.nombre}
                                        </p>
                                        <UnitBadge
                                            unidad={item.unidad}
                                            className="mt-1.5"
                                        />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <QuantityInput
                                            value={item.cantidad}
                                            onChange={(cantidad) =>
                                                actualizar(item.id, {
                                                    cantidad,
                                                })
                                            }
                                            unidad={item.unidad}
                                            min={item.unidad === 'kg' ? 0.5 : 1}
                                            size="sm"
                                            label={`Cantidad de ${item.nombre}`}
                                        />
                                        <Button
                                            variant="quiet"
                                            size="sm"
                                            onClick={() => quitar(item.id)}
                                            aria-label={`Quitar ${item.nombre}`}
                                        >
                                            <Trash2
                                                className="size-4"
                                                aria-hidden="true"
                                            />
                                        </Button>
                                    </div>
                                </div>

                                <input
                                    type="text"
                                    value={item.nota ?? ''}
                                    onChange={(event) =>
                                        actualizar(item.id, {
                                            nota: event.target.value,
                                        })
                                    }
                                    placeholder="Nota para este producto (opcional)"
                                    aria-label={`Nota para ${item.nombre}`}
                                    maxLength={180}
                                    className="mt-3 h-9 w-full rounded-md border border-borde bg-crema px-3 text-sm text-texto placeholder:text-texto-suave focus:border-dorado focus:outline-none"
                                />
                            </li>
                        ))}
                    </ul>

                    {form.errors.items && (
                        <p className="mt-3 flex items-start gap-1.5 text-sm text-error">
                            <TriangleAlert
                                className="mt-0.5 size-4 shrink-0"
                                aria-hidden="true"
                            />
                            <span>{form.errors.items}</span>
                        </p>
                    )}
                </section>

                {/* Datos de contacto */}
                <section className="mt-10 border-t border-borde pt-8">
                    <h2 className="font-display text-2xl text-texto">
                        Tus datos
                    </h2>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <Input
                            label="Nombre y apellido"
                            required
                            value={form.data.nombre}
                            onChange={(e) =>
                                form.setData('nombre', e.target.value)
                            }
                            error={form.errors.nombre}
                            autoComplete="name"
                        />
                        <Input
                            label="Correo electrónico"
                            type="email"
                            required
                            value={form.data.email}
                            onChange={(e) =>
                                form.setData('email', e.target.value)
                            }
                            error={form.errors.email}
                            autoComplete="email"
                        />
                        <Input
                            label="Teléfono"
                            type="tel"
                            required
                            mono
                            value={form.data.telefono}
                            onChange={(e) =>
                                form.setData('telefono', e.target.value)
                            }
                            error={form.errors.telefono}
                            autoComplete="tel"
                            placeholder="351-555-0000"
                        />
                        {zonas.length > 0 ? (
                            <Select
                                label="Localidad"
                                placeholder="Elegí tu localidad"
                                options={[
                                    ...zonas.map((zona) => ({
                                        value: zona,
                                        label: zona,
                                    })),
                                    { value: 'Otra', label: 'Otra' },
                                ]}
                                value={form.data.localidad}
                                onChange={(e) =>
                                    form.setData('localidad', e.target.value)
                                }
                                error={form.errors.localidad}
                            />
                        ) : (
                            <Input
                                label="Localidad"
                                value={form.data.localidad}
                                onChange={(e) =>
                                    form.setData('localidad', e.target.value)
                                }
                                error={form.errors.localidad}
                            />
                        )}
                        <Input
                            label="Fecha del evento"
                            type="date"
                            hint="Sólo si la cotización es para una fecha puntual."
                            value={form.data.fecha_evento}
                            onChange={(e) =>
                                form.setData('fecha_evento', e.target.value)
                            }
                            error={form.errors.fecha_evento}
                            className="sm:col-span-2 sm:max-w-xs"
                        />
                        <Textarea
                            label="Mensaje"
                            className="sm:col-span-2"
                            placeholder="Contanos si es para un evento, con qué frecuencia comprarías, o cualquier detalle que nos sirva."
                            value={form.data.mensaje}
                            onChange={(e) =>
                                form.setData('mensaje', e.target.value)
                            }
                            error={form.errors.mensaje}
                        />
                    </div>

                    {/* Honeypot: invisible para una persona, irresistible para un bot. */}
                    <div
                        aria-hidden="true"
                        className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
                    >
                        <label htmlFor="sitio_web">Dejá este campo vacío</label>
                        <input
                            id="sitio_web"
                            type="text"
                            tabIndex={-1}
                            autoComplete="off"
                            value={form.data.sitio_web}
                            onChange={(e) =>
                                form.setData('sitio_web', e.target.value)
                            }
                        />
                    </div>

                    {form.errors.sitio_web && (
                        <p className="mt-4 text-sm text-error">
                            {form.errors.sitio_web}
                        </p>
                    )}
                </section>

                <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-borde pt-6">
                    <Button
                        type="submit"
                        size="lg"
                        loading={form.processing}
                        disabled={disponibles.length === 0}
                    >
                        {form.processing ? 'Enviando…' : 'Enviar solicitud'}
                    </Button>
                    <Link href="/productos">
                        <Button variant="secondary" size="lg">
                            Seguir mirando
                        </Button>
                    </Link>
                </div>
            </form>
        </PublicLayout>
    );
}
