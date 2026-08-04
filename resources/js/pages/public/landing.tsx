import { Head, Link } from '@inertiajs/react';
import { Clock, Instagram, MapPin, Phone } from 'lucide-react';
import Logo from '@/components/brand/logo';
import {
    Button,
    EmptyState,
    PhotoPlaceholder,
    ProductCard,
    useToast,
} from '@/components/ui';
import type { PublicProduct } from '@/components/ui';
import useCotizacion from '@/hooks/use-cotizacion';
import PublicLayout from '@/layouts/public-layout';

type Horario = { dias: string; horario: string };

type Panaderia = {
    nombre?: string;
    direccion?: string;
    telefono?: string;
    whatsapp?: string;
    email?: string;
    horarios?: Horario[];
    mapa?: { lat: number; lng: number };
    redes?: Record<string, string>;
};

type Props = {
    destacados: PublicProduct[];
    panaderia: Panaderia;
    zonas: string[];
};

export default function Landing({ destacados, panaderia, zonas }: Props) {
    const { agregar } = useCotizacion();
    const { push } = useToast();

    const onAdd = (product: PublicProduct, cantidad: number) => {
        agregar(
            {
                id: product.id,
                slug: product.slug,
                nombre: product.nombre,
                unidad: product.unidad,
            },
            cantidad,
        );
        push('exito', `Agregaste ${product.nombre} a tu cotización.`);
    };

    const mapa = panaderia.mapa;

    return (
        <PublicLayout>
            <Head title="Panadería de barrio en Córdoba" />

            {/* Hero */}
            <section className="border-b border-borde bg-papel">
                <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:py-20 lg:grid-cols-2 lg:items-center">
                    <div>
                        <Logo
                            size={44}
                            withWordmark={false}
                            className="text-carbon"
                        />
                        <h1 className="mt-6 font-display text-4xl leading-[1.1] text-texto sm:text-5xl lg:text-6xl">
                            El pan que sale del horno a las seis de la mañana
                        </h1>
                        <p className="mt-5 max-w-lg text-lg text-texto-medio">
                            Masa madre de fermentación lenta, facturas de
                            manteca y pastelería hecha el mismo día. Armá tu
                            lista y te pasamos el presupuesto.
                        </p>

                        <div className="mt-8 flex flex-wrap items-center gap-3">
                            <Link href="/productos">
                                <Button size="lg">Pedir cotización</Button>
                            </Link>
                            <Link href="/login">
                                <Button size="lg" variant="secondary">
                                    Acceso comercios
                                </Button>
                            </Link>
                        </div>

                        <p className="mt-4 text-sm text-texto-suave">
                            ¿Sos comercio y todavía no tenés cuenta?{' '}
                            <Link
                                href="/comercios/solicitar"
                                className="underline underline-offset-4 hover:text-bordo"
                            >
                                Pedí el alta mayorista
                            </Link>
                            .
                        </p>
                    </div>

                    <PhotoPlaceholder
                        label="mostrador con pan recién horneado"
                        ratio="3:2"
                        className="w-full"
                    />
                </div>
            </section>

            {/* Destacados */}
            <section className="mx-auto max-w-6xl px-4 py-16">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h2 className="font-display text-3xl text-texto sm:text-4xl">
                            Lo que más nos piden
                        </h2>
                        <p className="mt-2 max-w-lg text-texto-medio">
                            Elegí cantidad y sumalo a tu cotización. Te
                            respondemos con precios dentro de las 24 horas
                            hábiles.
                        </p>
                    </div>
                    <Link
                        href="/productos"
                        className="text-sm font-medium text-bordo underline underline-offset-4 hover:text-bordo-hover"
                    >
                        Ver el catálogo completo
                    </Link>
                </div>

                {destacados.length === 0 ? (
                    <EmptyState
                        className="mt-8"
                        title="Todavía no hay destacados"
                        description="En cuanto la panadería marque sus productos estrella, aparecen acá."
                        action={
                            <Link href="/productos">
                                <Button variant="secondary">
                                    Ver el catálogo
                                </Button>
                            </Link>
                        }
                    />
                ) : (
                    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {destacados.map((producto) => (
                            <ProductCard
                                key={producto.id}
                                product={producto}
                                onAdd={onAdd}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* Sobre la panadería */}
            <section
                id="sobre"
                className="scroll-mt-20 border-y border-borde bg-papel"
            >
                <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-2 lg:items-center">
                    <PhotoPlaceholder
                        label="amasado a mano en el obrador"
                        ratio="4:3"
                    />

                    <div>
                        <h2 className="font-display text-3xl text-texto sm:text-4xl">
                            Tres generaciones amasando lo mismo
                        </h2>
                        <div className="mt-5 grid gap-4 text-texto-medio">
                            <p>
                                Abrimos en 1987 en una esquina de barrio y
                                seguimos en la misma. El pan de campo lleva
                                dieciocho horas de fermentación, las facturas se
                                hojaldran a mano y la pastelería sale del horno
                                el mismo día en que se vende.
                            </p>
                            <p>
                                Trabajamos con almacenes, kioscos, bares y
                                confiterías de Córdoba y alrededores. Si tenés
                                un comercio, pedí el alta y accedé a precios
                                mayoristas, cuenta corriente y entregas
                                programadas.
                            </p>
                        </div>

                        {zonas.length > 0 && (
                            <div className="mt-6 rounded-lg border border-borde bg-crema p-4">
                                <p className="text-sm font-semibold text-texto">
                                    Zonas de entrega
                                </p>
                                <p className="mt-1.5 font-mono text-sm text-texto-medio">
                                    {zonas.join(' · ')}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Ubicación */}
            <section
                id="ubicacion"
                className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16"
            >
                <h2 className="font-display text-3xl text-texto sm:text-4xl">
                    Dónde estamos
                </h2>

                <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
                    <div className="grid gap-4 self-start">
                        <div className="rounded-lg border border-borde bg-papel p-5">
                            <p className="flex items-start gap-2.5 text-texto">
                                <MapPin
                                    className="mt-0.5 size-4 shrink-0 text-dorado"
                                    aria-hidden="true"
                                />
                                <span>
                                    {panaderia.direccion ??
                                        'Córdoba, Argentina'}
                                </span>
                            </p>
                            {panaderia.telefono && (
                                <p className="mt-3 flex items-start gap-2.5 text-texto">
                                    <Phone
                                        className="mt-0.5 size-4 shrink-0 text-dorado"
                                        aria-hidden="true"
                                    />
                                    <a
                                        href={`tel:${panaderia.telefono.replace(/[^\d+]/g, '')}`}
                                        className="font-mono underline underline-offset-4 hover:text-bordo"
                                    >
                                        {panaderia.telefono}
                                    </a>
                                </p>
                            )}
                            {panaderia.redes?.instagram && (
                                <p className="mt-3 flex items-start gap-2.5 text-texto">
                                    <Instagram
                                        className="mt-0.5 size-4 shrink-0 text-dorado"
                                        aria-hidden="true"
                                    />
                                    <a
                                        href={panaderia.redes.instagram}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="underline underline-offset-4 hover:text-bordo"
                                    >
                                        @panaderiafenix
                                    </a>
                                </p>
                            )}
                        </div>

                        {panaderia.horarios &&
                            panaderia.horarios.length > 0 && (
                                <div className="rounded-lg border border-borde bg-papel p-5">
                                    <p className="flex items-center gap-2.5 font-semibold text-texto">
                                        <Clock
                                            className="size-4 shrink-0 text-dorado"
                                            aria-hidden="true"
                                        />
                                        Horarios de atención
                                    </p>
                                    <dl className="mt-3 grid gap-2">
                                        {panaderia.horarios.map((h) => (
                                            <div
                                                key={h.dias}
                                                className="flex flex-wrap items-baseline justify-between gap-2 border-b border-borde pb-2 last:border-0 last:pb-0"
                                            >
                                                <dt className="text-sm text-texto-medio">
                                                    {h.dias}
                                                </dt>
                                                <dd className="font-mono text-sm text-texto">
                                                    {h.horario}
                                                </dd>
                                            </div>
                                        ))}
                                    </dl>
                                </div>
                            )}
                    </div>

                    {mapa ? (
                        <iframe
                            title="Mapa de la panadería"
                            loading="lazy"
                            className="h-80 w-full rounded-lg border border-borde lg:h-full"
                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapa.lng - 0.006}%2C${mapa.lat - 0.004}%2C${mapa.lng + 0.006}%2C${mapa.lat + 0.004}&layer=mapnik&marker=${mapa.lat}%2C${mapa.lng}`}
                        />
                    ) : (
                        <PhotoPlaceholder
                            label="mapa de la panadería"
                            ratio="4:3"
                        />
                    )}
                </div>
            </section>
        </PublicLayout>
    );
}
