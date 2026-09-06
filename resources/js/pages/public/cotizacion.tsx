import { Head, Link, useForm } from '@inertiajs/react';
import { Pencil, ShoppingBasket, TriangleAlert, Wallet } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import {
    Button,
    DatePicker,
    EmptyState,
    Input,
    Pasos,
    Select,
    Textarea,
    Thumb,
} from '@/components/ui';
import type { PublicProduct } from '@/components/ui';
import usePedido from '@/hooks/use-pedido';
import usePedidoRevalidado from '@/hooks/use-pedido-revalidado';
import PublicLayout from '@/layouts/public-layout';
import { PASOS_PEDIDO, cantidadConUnidad, claveLinea } from '@/lib/pedido';
import { cn } from '@/lib/utils';

type Props = {
    /** Productos todavía activos, entre los que el visitante venía trayendo. */
    productos: PublicProduct[];
    /** Ids por los que el servidor efectivamente preguntó. */
    consultados: number[];
    zonas: string[];
    /** Seña que se pide para reservar el pedido, en pesos. 0 oculta el aviso. */
    sena: number;
};

type TipoPedido = 'minorista' | 'mayorista';

type FormData = {
    nombre: string;
    telefono: string;
    tipo: TipoPedido;
    localidad: string;
    fecha_evento: string;
    mensaje: string;
    sitio_web: string;
    items: {
        product_id: number;
        variante: string;
        cantidad: number;
        nota: string;
    }[];
};

const TIPOS: { value: TipoPedido; label: string; hint: string }[] = [
    {
        value: 'minorista',
        label: 'Minorista / casual',
        hint: 'Para tu casa, un evento o una compra puntual.',
    },
    {
        value: 'mayorista',
        label: 'Mayorista',
        hint: 'Para revender o abastecer tu comercio.',
    },
];

/**
 * Paso 2: sólo los datos de contacto. El pedido ya se revisó en `/carrito` y
 * acá aparece como resumen de lectura — mezclar lista editable y formulario en
 * una misma pantalla era lo que hacía imposible saber qué se estaba enviando.
 */
export default function Cotizacion({
    productos,
    consultados,
    zonas,
    sena,
}: Props) {
    const { vaciar } = usePedido();
    const { disponibles } = usePedidoRevalidado(
        '/cotizacion',
        productos,
        consultados,
    );

    const form = useForm<FormData>({
        nombre: '',
        telefono: '',
        tipo: 'minorista',
        localidad: '',
        fecha_evento: '',
        mensaje: '',
        sitio_web: '',
        items: [],
    });

    // Hoy en ISO local: la fecha del evento no puede ser en el pasado.
    const hoyISO = useMemo(() => {
        const hoy = new Date();
        const mes = String(hoy.getMonth() + 1).padStart(2, '0');
        const dia = String(hoy.getDate()).padStart(2, '0');

        return `${hoy.getFullYear()}-${mes}-${dia}`;
    }, []);

    // El listado de ítems se sincroniza desde el almacenamiento local.
    useEffect(() => {
        form.setData(
            'items',
            disponibles.map((item) => ({
                product_id: item.id,
                variante: item.variante ?? '',
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

    if (disponibles.length === 0) {
        return (
            <PublicLayout sinPedido>
                <Head title="Tus datos" />
                <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
                    <EmptyState
                        title="Tu pedido está vacío"
                        description="Recorré el catálogo y agregá lo que quieras. Después dejás tus datos y te pasamos los precios."
                        icon={<ShoppingBasket className="size-8" />}
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
        <PublicLayout sinPedido>
            <Head title="Tus datos" />

            <form
                onSubmit={enviar}
                className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16"
            >
                <Pasos pasos={PASOS_PEDIDO} actual={1} />

                <h1 className="mt-8 font-display text-seccion text-texto">
                    Tus datos
                </h1>
                <p className="mt-3 max-w-lg leading-relaxed text-texto-medio">
                    Con esto te respondemos con precios dentro de las 24 horas
                    hábiles.
                </p>

                {/* Resumen de lectura: lo editable quedó en el paso anterior. */}
                <section className="mt-10 overflow-hidden rounded-xl bg-papel shadow-xs ring-1 ring-borde">
                    <div className="flex items-center justify-between gap-3 border-b border-borde px-5 py-4">
                        <h2 className="font-display text-xl text-texto">
                            Lo que vas a pedir
                        </h2>
                        <Link
                            href="/carrito"
                            className="inline-flex items-center gap-1.5 text-sm text-texto-medio underline underline-offset-4 hover:text-bordo"
                        >
                            <Pencil className="size-3.5" aria-hidden="true" />
                            Editar
                        </Link>
                    </div>

                    <ul className="divide-y divide-borde">
                        {disponibles.map((item) => (
                            <li
                                key={claveLinea(item.id, item.variante)}
                                className="flex items-center gap-3 px-5 py-3.5"
                            >
                                <Thumb
                                    src={item.imagen ?? null}
                                    className="size-10"
                                />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-texto">
                                        {item.nombre}
                                        {item.variante && (
                                            <span className="text-texto-medio">
                                                {' '}
                                                · {item.variante}
                                            </span>
                                        )}
                                    </p>
                                    {item.nota && (
                                        <p className="truncate text-xs text-texto-medio">
                                            {item.nota}
                                        </p>
                                    )}
                                </div>
                                <p className="shrink-0 font-mono text-sm text-texto">
                                    {cantidadConUnidad(
                                        item.cantidad,
                                        item.unidad,
                                    )}
                                </p>
                            </li>
                        ))}
                    </ul>
                </section>

                {form.errors.items && (
                    <p className="mt-3 flex items-start gap-1.5 text-sm text-error">
                        <TriangleAlert
                            className="mt-0.5 size-4 shrink-0"
                            aria-hidden="true"
                        />
                        <span>{form.errors.items}</span>
                    </p>
                )}

                {/* Tipo de pedido: define a qué contacto se le abre el WhatsApp. */}
                <section className="mt-14 border-t border-borde pt-10">
                    <h2 className="font-display text-3xl text-texto">
                        Tipo de pedido
                    </h2>
                    <p className="mt-1 text-texto-medio">
                        Así te derivamos con la persona correcta.
                    </p>

                    <div
                        role="radiogroup"
                        aria-label="Tipo de pedido"
                        className="mt-4 grid gap-3 sm:grid-cols-2"
                    >
                        {TIPOS.map((tipo) => {
                            const activo = form.data.tipo === tipo.value;

                            return (
                                <button
                                    key={tipo.value}
                                    type="button"
                                    role="radio"
                                    aria-checked={activo}
                                    onClick={() =>
                                        form.setData('tipo', tipo.value)
                                    }
                                    className={cn(
                                        'rounded-lg border p-4 text-left transition',
                                        activo
                                            ? 'border-bordo bg-bordo/5 ring-1 ring-bordo'
                                            : 'border-borde hover:border-texto-suave',
                                    )}
                                >
                                    <span className="block font-medium text-texto">
                                        {tipo.label}
                                    </span>
                                    <span className="mt-1 block text-sm text-texto-medio">
                                        {tipo.hint}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                    {form.errors.tipo && (
                        <p className="mt-2 text-sm text-error">
                            {form.errors.tipo}
                        </p>
                    )}
                </section>

                {/* Datos de contacto */}
                <section className="mt-14 border-t border-borde pt-10">
                    <h2 className="font-display text-3xl text-texto">
                        Cómo te contactamos
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
                        <DatePicker
                            label="Fecha del evento"
                            hint="Sólo si el pedido es para una fecha puntual."
                            min={hoyISO}
                            value={form.data.fecha_evento}
                            onChange={(valor) =>
                                form.setData('fecha_evento', valor)
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

                {sena > 0 && (
                    <div className="mt-10 flex items-start gap-3 rounded-xl bg-dorado/10 p-5 ring-1 ring-dorado/30">
                        <Wallet
                            className="mt-0.5 size-5 shrink-0 text-dorado"
                            aria-hidden="true"
                        />
                        <p className="text-sm leading-relaxed text-texto">
                            Para reservar el pedido se pide una seña de{' '}
                            <span className="font-semibold">
                                ${sena.toLocaleString('es-AR')}
                            </span>
                            . Te pasamos cómo abonarla cuando confirmemos los
                            precios.
                        </p>
                    </div>
                )}

                <div className="mt-12 flex flex-wrap items-center gap-3 border-t border-borde pt-8">
                    <Button type="submit" size="lg" loading={form.processing}>
                        {form.processing ? 'Enviando…' : 'Enviar el pedido'}
                    </Button>
                    <Link href="/carrito">
                        <Button variant="secondary" size="lg">
                            Volver al pedido
                        </Button>
                    </Link>
                </div>
            </form>
        </PublicLayout>
    );
}
