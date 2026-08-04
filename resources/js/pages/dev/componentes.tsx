import { Head } from '@inertiajs/react';
import { PackageOpen, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import Logo from '@/components/brand/logo';
import {
    Badge,
    Button,
    Checkbox,
    EmptyState,
    ErrorState,
    Input,
    LoadingState,
    Modal,
    PhotoPlaceholder,
    ProductCard,
    QuantityInput,
    Select,
    Skeleton,
    StackedField,
    StackedRow,
    StatusBadge,
    TBody,
    TD,
    TH,
    THead,
    TR,
    Table,
    Textarea,
    UnitBadge,
    useToast,
} from '@/components/ui';
import type { PublicProduct } from '@/components/ui';
import useFlashToast from '@/hooks/use-flash-toast';
import {
    businessEstados,
    orderEstados,
    quoteEstados,
    quoteRequestEstados,
} from '@/lib/estados';
import { money, shortDate } from '@/lib/format';

function Section({
    title,
    note,
    children,
}: {
    title: string;
    note?: string;
    children: ReactNode;
}) {
    return (
        <section className="border-t border-borde pt-8">
            <h2 className="font-display text-2xl text-texto">{title}</h2>
            {note && (
                <p className="mt-1 max-w-2xl text-sm text-texto-medio">
                    {note}
                </p>
            )}
            <div className="mt-5">{children}</div>
        </section>
    );
}

const productosDemo: PublicProduct[] = [
    {
        id: 1,
        slug: 'pan-de-campo',
        nombre: 'Pan de campo',
        descripcion:
            'Masa madre de fermentación lenta, 18 horas de reposo. Pieza de 800 g.',
        unidad: 'unidad',
        imagen: null,
    },
    {
        id: 2,
        slug: 'facturas-surtidas',
        nombre: 'Facturas surtidas',
        descripcion:
            'Medialunas, vigilantes, cañoncitos y libritos. Docena mixta.',
        unidad: 'docena',
        imagen: null,
    },
    {
        id: 3,
        slug: 'criollos-hojaldrados',
        nombre: 'Criollos hojaldrados',
        descripcion: 'Grasa vacuna y sal gruesa. Se venden por kilo.',
        unidad: 'kg',
        imagen: null,
    },
];

const movimientosDemo = [
    {
        fecha: '2026-07-28',
        concepto: 'Pedido PED-2026-0184',
        debito: '86400.00',
        credito: null,
    },
    {
        fecha: '2026-07-25',
        concepto: 'Pago recibido',
        debito: null,
        credito: '150000.00',
    },
    {
        fecha: '2026-07-21',
        concepto: 'Pedido PED-2026-0171',
        debito: '64200.00',
        credito: null,
    },
];

export default function Componentes() {
    useFlashToast();

    const { push } = useToast();
    const [modalAbierto, setModalAbierto] = useState(false);
    const [cantidad, setCantidad] = useState(3);
    const [conError, setConError] = useState(false);

    return (
        <div className="min-h-dvh bg-crema">
            <Head title="Componentes" />

            <header className="border-b border-borde bg-papel">
                <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
                    <Logo size={28} className="text-carbon" />
                    <Badge mono>FASE 2 · SOLO LOCAL</Badge>
                </div>
            </header>

            <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10">
                <div>
                    <h1 className="font-display text-4xl text-texto">
                        Componentes base
                    </h1>
                    <p className="mt-2 max-w-2xl text-texto-medio">
                        Todo construido sobre los tokens: nada de colores,
                        radios ni sombras fuera del sistema. Esta página es una
                        ayuda de revisión y no forma parte del sistema; se borra
                        cuando digas.
                    </p>
                </div>

                <Section
                    title="Tipografía"
                    note="DM Serif Display sólo en títulos. Work Sans en toda la interfaz. JetBrains Mono en números, SKU y estados."
                >
                    <div className="grid gap-3 rounded-lg border border-borde bg-papel p-5">
                        <p className="font-display text-3xl text-texto">
                            Pan de masa madre, todos los días
                        </p>
                        <p className="text-texto-medio">
                            Work Sans para navegación, botones, labels y
                            párrafos.
                        </p>
                        <p className="font-mono text-sm text-texto">
                            PED-2026-0184 · SKU PAN-CAM-002 · {money('86400')} ·
                            28/07/2026
                        </p>
                    </div>
                </Section>

                <Section title="Paleta">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                        {[
                            ['dorado', 'bg-dorado'],
                            ['bordo', 'bg-bordo'],
                            ['carbón', 'bg-carbon'],
                            ['crema', 'bg-crema'],
                            ['papel', 'bg-papel'],
                            ['borde', 'bg-borde'],
                            ['éxito', 'bg-exito'],
                            ['alerta', 'bg-alerta'],
                            ['error', 'bg-error'],
                            ['info', 'bg-info'],
                            ['texto', 'bg-texto'],
                            ['texto medio', 'bg-texto-medio'],
                        ].map(([nombre, clase]) => (
                            <div key={nombre} className="grid gap-1.5">
                                <div
                                    className={`h-14 rounded-md border border-borde ${clase}`}
                                    aria-hidden="true"
                                />
                                <span className="font-mono text-xs text-texto-medio">
                                    {nombre}
                                </span>
                            </div>
                        ))}
                    </div>
                </Section>

                <Section title="Botones">
                    <div className="flex flex-col gap-4 rounded-lg border border-borde bg-papel p-5">
                        <div className="flex flex-wrap items-center gap-3">
                            <Button>Pedir cotización</Button>
                            <Button variant="secondary">
                                Acceso comercios
                            </Button>
                            <Button
                                variant="destructive"
                                icon={
                                    <Trash2
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                }
                            >
                                Cancelar pedido
                            </Button>
                            <Button variant="quiet">Ver detalle</Button>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <Button size="sm">Chico</Button>
                            <Button size="md">Mediano</Button>
                            <Button size="lg">Grande</Button>
                            <Button loading>Guardando</Button>
                            <Button disabled>Deshabilitado</Button>
                        </div>
                    </div>
                </Section>

                <Section
                    title="Formularios"
                    note="Label, ayuda y error con los aria-* ya cableados. El error nunca es sólo color: lleva ícono y texto."
                >
                    <div className="grid gap-4 rounded-lg border border-borde bg-papel p-5 sm:grid-cols-2">
                        <Input
                            label="Razón social"
                            placeholder="Almacén Don Pedro S.R.L."
                            required
                        />
                        <Input
                            label="CUIT"
                            mono
                            placeholder="30-71234567-4"
                            hint="Sin puntos, con guiones."
                        />
                        <Select
                            label="Condición IVA"
                            placeholder="Elegí una opción"
                            options={[
                                {
                                    value: 'responsable_inscripto',
                                    label: 'Responsable inscripto',
                                },
                                { value: 'monotributo', label: 'Monotributo' },
                                { value: 'exento', label: 'Exento' },
                                {
                                    value: 'consumidor_final',
                                    label: 'Consumidor final',
                                },
                            ]}
                        />
                        <Input
                            label="Correo de contacto"
                            type="email"
                            defaultValue="compras@"
                            error={
                                conError
                                    ? 'Ingresá un correo válido.'
                                    : undefined
                            }
                        />
                        <Textarea
                            label="Observaciones"
                            className="sm:col-span-2"
                            placeholder="Entregar antes de las 8, tocar timbre del costado."
                        />
                        <div className="sm:col-span-2">
                            <Checkbox
                                label="Mostrar el estado de error"
                                checked={conError}
                                onChange={(event) =>
                                    setConError(event.target.checked)
                                }
                            />
                        </div>
                    </div>
                </Section>

                <Section
                    title="Badges de estado"
                    note="Ícono más texto en todos los casos: siguen siendo legibles en blanco y negro."
                >
                    <div className="grid gap-4 rounded-lg border border-borde bg-papel p-5">
                        <div className="flex flex-wrap gap-2">
                            {Object.keys(orderEstados).map((estado) => (
                                <StatusBadge
                                    key={estado}
                                    domain="order"
                                    estado={estado as keyof typeof orderEstados}
                                />
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {Object.keys(businessEstados).map((estado) => (
                                <StatusBadge
                                    key={estado}
                                    domain="business"
                                    estado={
                                        estado as keyof typeof businessEstados
                                    }
                                />
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {Object.keys(quoteRequestEstados).map((estado) => (
                                <StatusBadge
                                    key={estado}
                                    domain="quoteRequest"
                                    estado={
                                        estado as keyof typeof quoteRequestEstados
                                    }
                                />
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {Object.keys(quoteEstados).map((estado) => (
                                <StatusBadge
                                    key={estado}
                                    domain="quote"
                                    estado={estado as keyof typeof quoteEstados}
                                />
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-2 border-t border-borde pt-4">
                            <UnitBadge unidad="unidad" />
                            <UnitBadge unidad="kg" />
                            <UnitBadge unidad="docena" />
                            <UnitBadge unidad="bandeja" />
                        </div>
                    </div>
                </Section>

                <Section
                    title="Tarjeta de producto"
                    note="Sin precio. El peso visual que ocuparía el precio lo toma la unidad de venta, y el ancla es el botón de agregar."
                >
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {productosDemo.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onAdd={(p, c) =>
                                    push(
                                        'exito',
                                        `Agregaste ${c} × ${p.nombre} a tu cotización.`,
                                    )
                                }
                            />
                        ))}
                    </div>
                </Section>

                <Section title="Cantidad y hueco de foto">
                    <div className="grid gap-5 rounded-lg border border-borde bg-papel p-5 sm:grid-cols-2">
                        <div className="flex flex-col gap-3">
                            <QuantityInput
                                value={cantidad}
                                onChange={setCantidad}
                            />
                            <QuantityInput
                                value={cantidad}
                                onChange={setCantidad}
                                unidad="kg"
                                size="sm"
                            />
                            <p className="text-sm text-texto-medio">
                                En kilos el paso es 0,5; en el resto de las
                                unidades es 1.
                            </p>
                        </div>
                        <PhotoPlaceholder label="pan de campo" />
                    </div>
                </Section>

                <Section
                    title="Tabla"
                    note="Borde hairline, sin cebra ni sombra. Los números van a la derecha y en mono."
                >
                    <Table>
                        <THead>
                            <TR>
                                <TH>Fecha</TH>
                                <TH>Concepto</TH>
                                <TH numeric>Débito</TH>
                                <TH numeric>Crédito</TH>
                            </TR>
                        </THead>
                        <TBody>
                            {movimientosDemo.map((m) => (
                                <TR key={m.fecha + m.concepto}>
                                    <TD numeric className="text-left">
                                        {shortDate(m.fecha)}
                                    </TD>
                                    <TD>{m.concepto}</TD>
                                    <TD numeric>
                                        {m.debito ? money(m.debito) : '—'}
                                    </TD>
                                    <TD numeric>
                                        {m.credito ? money(m.credito) : '—'}
                                    </TD>
                                </TR>
                            ))}
                        </TBody>
                    </Table>

                    <p className="mt-5 mb-2 text-sm text-texto-medio">
                        La misma información en mobile, apilada en tarjetas:
                    </p>
                    <div className="grid max-w-sm gap-2">
                        {movimientosDemo.map((m) => (
                            <StackedRow key={m.concepto}>
                                <p className="mb-1 font-medium text-texto">
                                    {m.concepto}
                                </p>
                                <StackedField
                                    label="Fecha"
                                    value={shortDate(m.fecha)}
                                    numeric
                                />
                                <StackedField
                                    label="Débito"
                                    value={m.debito ? money(m.debito) : '—'}
                                    numeric
                                />
                                <StackedField
                                    label="Crédito"
                                    value={m.credito ? money(m.credito) : '—'}
                                    numeric
                                />
                            </StackedRow>
                        ))}
                    </div>
                </Section>

                <Section title="Modal y avisos">
                    <div className="flex flex-wrap gap-3 rounded-lg border border-borde bg-papel p-5">
                        <Button
                            variant="secondary"
                            onClick={() => setModalAbierto(true)}
                        >
                            Abrir modal
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() =>
                                push('exito', 'El pedido quedó confirmado.')
                            }
                        >
                            Toast de éxito
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() =>
                                push(
                                    'alerta',
                                    'Ya pasó la hora de corte de hoy.',
                                )
                            }
                        >
                            Toast de alerta
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() =>
                                push('error', 'Superás tu límite de crédito.')
                            }
                        >
                            Toast de error
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() =>
                                push('info', 'Tu cotización vence en 3 días.')
                            }
                        >
                            Toast informativo
                        </Button>
                    </div>

                    <Modal
                        open={modalAbierto}
                        onClose={() => setModalAbierto(false)}
                        title="Cancelar el pedido"
                        description="PED-2026-0184 · entrega del 04/08"
                        footer={
                            <>
                                <Button
                                    variant="secondary"
                                    onClick={() => setModalAbierto(false)}
                                >
                                    Volver
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => {
                                        setModalAbierto(false);
                                        push(
                                            'exito',
                                            'El pedido quedó cancelado.',
                                        );
                                    }}
                                >
                                    Cancelar el pedido
                                </Button>
                            </>
                        }
                    >
                        <p className="text-sm text-texto-medio">
                            El pedido sale de la cola de preparación y no
                            impacta en la cuenta corriente. Esta acción no se
                            puede deshacer.
                        </p>
                    </Modal>
                </Section>

                <Section
                    title="Estados vacío, de carga y de error"
                    note="Diseñados desde el arranque, no sólo el caso feliz."
                >
                    <div className="grid gap-4 lg:grid-cols-3">
                        <EmptyState
                            title="Todavía no hiciste pedidos"
                            description="Cuando cargues el primero, va a aparecer acá con su estado y su fecha de entrega."
                            icon={<PackageOpen className="size-8" />}
                            action={
                                <Button
                                    icon={
                                        <Plus
                                            className="size-4"
                                            aria-hidden="true"
                                        />
                                    }
                                >
                                    Nuevo pedido
                                </Button>
                            }
                        />
                        <LoadingState label="Buscando productos…" />
                        <ErrorState
                            description="Se cortó la conexión con el servidor mientras cargábamos tus pedidos."
                            onRetry={() => push('info', 'Reintentando…')}
                        />
                    </div>

                    <div className="mt-4 grid gap-2 rounded-lg border border-borde bg-papel p-5">
                        <p className="mb-1 text-sm text-texto-medio">
                            Esqueleto de carga:
                        </p>
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                </Section>
            </main>
        </div>
    );
}
