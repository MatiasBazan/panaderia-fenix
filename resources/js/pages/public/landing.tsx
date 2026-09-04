import { Head, Link } from '@inertiajs/react';
import { Clock, Instagram, MapPin, Phone } from 'lucide-react';
import {
    Button,
    EmptyState,
    PhotoPlaceholder,
    ProductCard,
} from '@/components/ui';
import type { PublicProduct } from '@/components/ui';
import PublicLayout from '@/layouts/public-layout';

type Horario = { dias: string; horario: string };

type Contacto = { nombre: string; telefono: string; whatsapp: string };

type Panaderia = {
    nombre?: string;
    direccion?: string;
    contactos?: Contacto[];
    email?: string;
    horarios?: Horario[];
    mapa?: { lat: number; lng: number };
    mapa_url?: string;
    redes?: Record<string, string>;
};

type Props = {
    destacados: PublicProduct[];
    panaderia: Panaderia;
    zonas: string[];
};

/** El oficio contado en números: lo que distingue una panadería de una fábrica. */
const oficio = [
    { dato: '1987', detalle: 'en la misma esquina' },
    { dato: '18 h', detalle: 'de fermentación lenta' },
    { dato: '06:00', detalle: 'primera hornada del día' },
    { dato: '7 días', detalle: 'incluidos los domingos' },
];

const pasos = [
    {
        titulo: 'Armá la lista',
        texto: 'Elegí productos y cantidades desde el catálogo. El pedido queda guardado en este navegador mientras mirás.',
    },
    {
        titulo: 'Pedinos los precios',
        texto: 'Dejás tus datos y nos llega la lista completa. No publicamos precios porque cambian según cantidad y frecuencia.',
    },
    {
        titulo: 'Coordinamos la entrega',
        texto: 'Te respondemos dentro de las 24 horas hábiles con precios, y ajustamos cantidades y días por WhatsApp.',
    },
];

export default function Landing({ destacados, panaderia, zonas }: Props) {
    const mapa = panaderia.mapa;

    return (
        <PublicLayout>
            <Head title="Panadería de barrio en Leones" />

            {/* Hero: el titular manda, la foto lo acompaña desde el margen. */}
            <section className="grano relative overflow-hidden border-b border-borde halo-horno">
                <div className="relative z-1 mx-auto grid max-w-6xl gap-12 px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
                    <div>
                        <p className="font-mono text-[11px] tracking-[0.2em] text-bordo uppercase">
                            Leones · Desde 1987
                        </p>

                        <h1 className="mt-6 font-display text-titular text-texto">
                            El pan que sale del horno
                            <span className="text-dorado-hover italic">
                                {' '}
                                a las seis
                            </span>{' '}
                            de la mañana
                        </h1>

                        <p className="mt-7 max-w-lg text-lg leading-relaxed text-texto-medio">
                            Masa madre de fermentación lenta, facturas de
                            manteca hojaldradas a mano y pastelería hecha el
                            mismo día. Armá tu pedido y te pasamos los precios.
                        </p>

                        <div className="mt-9 flex flex-wrap items-center gap-4">
                            <Link href="/productos">
                                <Button size="lg">Armar mi pedido</Button>
                            </Link>
                            <Link
                                href="/#sobre"
                                className="text-sm font-medium text-texto underline decoration-dorado decoration-2 underline-offset-[6px] transition-colors hover:text-bordo"
                            >
                                Conocer la panadería
                            </Link>
                        </div>
                    </div>

                    {/* Dos fotos desalineadas a propósito: el mostrador y el detalle. */}
                    <div className="relative pb-14 sm:pb-16 lg:pb-20">
                        <PhotoPlaceholder
                            label="mostrador con pan recién horneado"
                            ratio="3:2"
                            className="w-full shadow-lg"
                        />
                        <PhotoPlaceholder
                            label="miga"
                            ratio="1:1"
                            className="absolute -bottom-2 left-2 w-28 shadow-alzado sm:w-36 lg:-left-10 lg:w-44"
                        />
                    </div>
                </div>

                {/* Franja de oficio: números en mono, sin cajas ni tarjetas. */}
                <div className="relative z-1 border-t border-borde/70">
                    <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-y-8 px-4 py-8 sm:px-6 lg:grid-cols-4">
                        {oficio.map((item) => (
                            <div key={item.dato} className="px-1">
                                <dt className="font-mono text-2xl leading-none text-texto sm:text-3xl">
                                    {item.dato}
                                </dt>
                                <dd className="mt-2 text-sm text-texto-medio">
                                    {item.detalle}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </section>

            {/* Destacados */}
            <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
                <div className="flex flex-wrap items-end justify-between gap-6">
                    <div>
                        <p className="font-mono text-[11px] tracking-[0.2em] text-texto-suave uppercase">
                            Del mostrador
                        </p>
                        <h2 className="mt-3 font-display text-seccion text-texto">
                            Lo que más nos piden
                        </h2>
                        <p className="mt-3 max-w-lg leading-relaxed text-texto-medio">
                            Elegí cantidad y sumalo a tu pedido. Te respondemos
                            con precios dentro de las 24 horas hábiles.
                        </p>
                    </div>
                    <Link
                        href="/productos"
                        className="text-sm font-medium text-bordo underline decoration-dorado decoration-2 underline-offset-[6px] transition-colors hover:text-bordo-hover"
                    >
                        Ver el catálogo completo
                    </Link>
                </div>

                {destacados.length === 0 ? (
                    <EmptyState
                        className="mt-10"
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
                    <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {destacados.map((producto) => (
                            <div key={producto.id} className="emerge">
                                <ProductCard product={producto} />
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Sobre la panadería */}
            <section
                id="sobre"
                className="grano relative scroll-mt-24 border-y border-borde bg-papel"
            >
                <div className="relative z-1 mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-16">
                    <div className="relative">
                        <PhotoPlaceholder
                            label="amasado a mano"
                            ratio="4:3"
                            className="shadow-lg"
                        />
                        <p className="mt-6 max-w-xs border-l-2 border-dorado pl-5 font-display text-xl leading-snug text-texto italic lg:absolute lg:-bottom-14 lg:-left-6 lg:mt-0 lg:max-w-sm lg:border-l-0 lg:bg-papel lg:p-6 lg:pl-6 lg:shadow-alzado">
                            “La masa avisa cuándo está. Uno solo tiene que
                            llegar a tiempo.”
                        </p>
                    </div>

                    <div className="lg:pl-6">
                        <p className="font-mono text-[11px] tracking-[0.2em] text-texto-suave uppercase">
                            El obrador
                        </p>
                        <h2 className="mt-3 font-display text-seccion text-texto">
                            Tres generaciones amasando lo mismo
                        </h2>

                        <div className="mt-6 grid gap-5 leading-relaxed text-texto-medio">
                            <p>
                                Abrimos en 1987 en una esquina de barrio y
                                seguimos en la misma. El pan de campo lleva
                                dieciocho horas de fermentación, las facturas se
                                hojaldran a mano y la pastelería sale del horno
                                el mismo día en que se vende.
                            </p>
                            <p>
                                Trabajamos con almacenes, kioscos, bares y
                                confiterías de Leones y alrededores. Armá tu
                                pedido, pedinos los precios y coordinamos
                                cantidades y entregas por WhatsApp.
                            </p>
                        </div>

                        {zonas.length > 0 && (
                            <div className="mt-8 border-t border-borde pt-6">
                                <p className="font-mono text-[11px] tracking-[0.18em] text-texto-suave uppercase">
                                    Zonas de entrega
                                </p>
                                <ul className="mt-3 flex flex-wrap gap-2">
                                    {zonas.map((zona) => (
                                        <li
                                            key={zona}
                                            className="rounded-sm bg-crema px-2.5 py-1 font-mono text-sm text-texto-medio ring-1 ring-borde"
                                        >
                                            {zona}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Cómo se pide: tres pasos numerados, sin tarjetas. */}
            <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
                <p className="font-mono text-[11px] tracking-[0.2em] text-texto-suave uppercase">
                    Cómo se pide
                </p>
                <h2 className="mt-3 max-w-xl font-display text-seccion text-texto">
                    De la lista al reparto, en tres pasos
                </h2>

                <ol className="mt-12 grid gap-10 sm:grid-cols-3 sm:gap-8">
                    {pasos.map((paso, indice) => (
                        <li
                            key={paso.titulo}
                            className="emerge border-t border-borde pt-6"
                        >
                            <span className="font-mono text-sm text-dorado-hover">
                                {String(indice + 1).padStart(2, '0')}
                            </span>
                            <h3 className="mt-3 font-display text-2xl text-texto">
                                {paso.titulo}
                            </h3>
                            <p className="mt-3 leading-relaxed text-texto-medio">
                                {paso.texto}
                            </p>
                        </li>
                    ))}
                </ol>

                <div className="mt-12">
                    <Link href="/productos">
                        <Button size="lg">Empezar el pedido</Button>
                    </Link>
                </div>
            </section>

            {/* Ubicación */}
            <section
                id="ubicacion"
                className="grano relative scroll-mt-24 border-t border-borde bg-papel"
            >
                <div className="relative z-1 mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
                    <p className="font-mono text-[11px] tracking-[0.2em] text-texto-suave uppercase">
                        La esquina
                    </p>
                    <h2 className="mt-3 font-display text-seccion text-texto">
                        Dónde estamos
                    </h2>

                    <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.35fr]">
                        <div className="grid content-between gap-6">
                            <div>
                                <p className="flex items-start gap-3 text-texto">
                                    <MapPin
                                        className="mt-1 size-4 shrink-0 text-dorado"
                                        aria-hidden="true"
                                    />
                                    <span className="leading-relaxed">
                                        {panaderia.direccion ??
                                            'Leones, Córdoba'}
                                        {panaderia.mapa_url && (
                                            <>
                                                {' · '}
                                                <a
                                                    href={panaderia.mapa_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="underline decoration-dorado underline-offset-4 hover:text-bordo"
                                                >
                                                    Cómo llegar
                                                </a>
                                            </>
                                        )}
                                    </span>
                                </p>

                                {panaderia.contactos?.map((contacto) => (
                                    <p
                                        key={contacto.whatsapp}
                                        className="mt-4 flex items-start gap-3 text-texto"
                                    >
                                        <Phone
                                            className="mt-1 size-4 shrink-0 text-dorado"
                                            aria-hidden="true"
                                        />
                                        <a
                                            href={`https://wa.me/${contacto.whatsapp}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="underline decoration-dorado underline-offset-4 hover:text-bordo"
                                        >
                                            <span className="font-mono">
                                                {contacto.telefono}
                                            </span>{' '}
                                            ({contacto.nombre})
                                        </a>
                                    </p>
                                ))}

                                {panaderia.redes?.instagram && (
                                    <p className="mt-4 flex items-start gap-3 text-texto">
                                        <Instagram
                                            className="mt-1 size-4 shrink-0 text-dorado"
                                            aria-hidden="true"
                                        />
                                        <a
                                            href={panaderia.redes.instagram}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="underline decoration-dorado underline-offset-4 hover:text-bordo"
                                        >
                                            @panaderiafenix
                                        </a>
                                    </p>
                                )}
                            </div>

                            {panaderia.horarios &&
                                panaderia.horarios.length > 0 && (
                                    <div className="border-t border-borde pt-6">
                                        <p className="flex items-center gap-3 font-mono text-[11px] tracking-[0.18em] text-texto-suave uppercase">
                                            <Clock
                                                className="size-4 shrink-0 text-dorado"
                                                aria-hidden="true"
                                            />
                                            Horarios de atención
                                        </p>
                                        <dl className="mt-4 grid gap-3">
                                            {panaderia.horarios.map((h) => (
                                                <div
                                                    key={h.dias}
                                                    className="flex flex-wrap items-baseline justify-between gap-2 border-b border-borde/70 pb-3 last:border-0 last:pb-0"
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
                            <div className="relative min-h-80 overflow-hidden rounded-xl shadow-lg ring-1 ring-borde lg:h-full">
                                <iframe
                                    title="Mapa de la panadería"
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    className="h-full min-h-80 w-full [filter:sepia(0.35)_saturate(1.15)_hue-rotate(-12deg)_brightness(1.03)]"
                                    src={`https://www.google.com/maps?q=${mapa.lat},${mapa.lng}&z=16&hl=es&output=embed`}
                                />
                                {/* Tarjeta flotante con la dirección y el acceso a indicaciones. */}
                                <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3 sm:p-4">
                                    <div className="pointer-events-auto flex flex-wrap items-center justify-between gap-3 rounded-lg bg-papel/95 px-4 py-3 shadow-alzado ring-1 filo ring-borde backdrop-blur-sm">
                                        <div className="flex items-start gap-3">
                                            <MapPin
                                                className="mt-1 size-4 shrink-0 text-dorado"
                                                aria-hidden="true"
                                            />
                                            <div>
                                                <p className="font-display text-lg leading-tight text-texto">
                                                    {panaderia.nombre ??
                                                        'Panadería Fénix'}
                                                </p>
                                                <p className="text-sm text-texto-medio">
                                                    {panaderia.direccion ??
                                                        'Leones, Córdoba'}
                                                </p>
                                            </div>
                                        </div>
                                        {panaderia.mapa_url && (
                                            <a
                                                href={panaderia.mapa_url}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                <Button
                                                    size="sm"
                                                    icon={
                                                        <MapPin className="size-4" />
                                                    }
                                                >
                                                    Cómo llegar
                                                </Button>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <PhotoPlaceholder
                                label="fachada de la panadería"
                                ratio="4:3"
                                className="shadow-lg"
                            />
                        )}
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
