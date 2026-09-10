import { Head, Link } from '@inertiajs/react';
import { Clock, Instagram, MapPin, Phone } from 'lucide-react';
import {
    Button,
    EmptyState,
    EnlaceAncla,
    FotoSitio,
    PhotoPlaceholder,
    ProductCard,
    condicionesEnFrase,
    useCondiciones,
} from '@/components/ui';
import type { PublicProduct } from '@/components/ui';
import PublicLayout from '@/layouts/public-layout';
import type { Condiciones } from '@/types/shared';

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

/** Fotos cargadas desde el admin, por hueco. Falta una = va el placeholder. */
type Fotos = Partial<Record<'mostrador' | 'miga' | 'amasado', string>>;

/** El catálogo activo agrupado, en el orden en que se ve el mostrador. */
type Grupo = {
    nombre: string;
    slug: string;
    productos: PublicProduct[];
};

type Props = {
    mostrador: Grupo[];
    panaderia: Panaderia;
    fotos: Fotos;
    zonas: string[];
};

/** El oficio contado en números: lo que distingue una panadería de una fábrica. */
const oficio = [
    { dato: '2021', detalle: 'desde el 8 de marzo' },
    { dato: 'Familiar', detalle: 'y artesanal, desde el primer día' },
    { dato: '07:00', detalle: 'abrimos con el pan del día' },
    { dato: '7 días', detalle: 'domingos incluidos' },
];

/** El tercer paso nombra las condiciones, que salen de `settings`. */
const construirPasos = (condiciones: Condiciones) => [
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
        texto: `Te respondemos dentro de las 24 horas hábiles con precios. Los pedidos se toman ${condicionesEnFrase(condiciones)}, y ajustamos cantidades y días por WhatsApp.`,
    },
];

export default function Landing({ mostrador, panaderia, fotos, zonas }: Props) {
    const mapa = panaderia.mapa;
    const pasos = construirPasos(useCondiciones());

    return (
        <PublicLayout>
            <Head title="Panadería familiar en Leones" />

            {/* Hero: el titular manda, la foto lo acompaña desde el margen. */}
            <section className="grano relative overflow-hidden border-b border-borde halo-horno">
                <div className="relative z-1 mx-auto grid max-w-6xl gap-12 px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
                    <div>
                        <p className="font-mono text-[11px] tracking-[0.2em] text-bordo uppercase">
                            Leones · Desde 2021
                        </p>

                        <h1 className="mt-6 font-display text-titular text-texto">
                            El buen sabor artesanal
                            <span className="text-dorado-hover italic">
                                {' '}
                                en cada rinconcito
                            </span>{' '}
                            de tu hogar
                        </h1>

                        <p className="mt-7 max-w-lg text-lg leading-relaxed text-texto-medio">
                            Panadería familiar de Leones. Pan, facturas y
                            pastelería del día, hechos con el compromiso que nos
                            caracteriza. Armá tu pedido y te pasamos los
                            precios.
                        </p>

                        <div className="mt-9 flex flex-wrap items-center gap-4">
                            <EnlaceAncla href="/#mostrador">
                                <Button size="lg">Armar mi pedido</Button>
                            </EnlaceAncla>
                            <EnlaceAncla
                                href="/#sobre"
                                className="text-sm font-medium text-texto underline decoration-dorado decoration-2 underline-offset-[6px] transition-colors hover:text-bordo"
                            >
                                Conocer la panadería
                            </EnlaceAncla>
                        </div>
                    </div>

                    {/* Dos fotos desalineadas a propósito: el mostrador y el detalle. */}
                    <div className="relative pb-14 sm:pb-16 lg:pb-20">
                        <FotoSitio
                            url={fotos.mostrador}
                            label="mostrador con pan recién horneado"
                            ratio="3:2"
                            className="w-full shadow-lg"
                        />
                        <FotoSitio
                            url={fotos.miga}
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

            {/* Mostrador */}
            <section
                id="mostrador"
                className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20 sm:px-6 sm:py-24"
            >
                <div className="flex flex-wrap items-end justify-between gap-6">
                    <div>
                        <p className="font-mono text-[11px] tracking-[0.2em] text-texto-suave uppercase">
                            Del mostrador
                        </p>
                        <h2 className="mt-3 font-display text-seccion text-texto">
                            Todo lo que horneamos
                        </h2>
                        <p className="mt-3 max-w-lg leading-relaxed text-texto-medio">
                            Elegí cantidad y sumalo a tu pedido, sin salir de
                            acá. Te respondemos con precios dentro de las 24
                            horas hábiles.
                        </p>
                    </div>
                    <Link
                        href="/productos"
                        className="text-sm font-medium text-bordo underline decoration-dorado decoration-2 underline-offset-[6px] transition-colors hover:text-bordo-hover"
                    >
                        Buscar en el catálogo
                    </Link>
                </div>

                {mostrador.length === 0 ? (
                    <EmptyState
                        className="mt-10"
                        title="Todavía no hay productos cargados"
                        description="En cuanto la panadería cargue el mostrador, aparece acá."
                        action={
                            <Link href="/productos">
                                <Button variant="secondary">
                                    Ver el catálogo
                                </Button>
                            </Link>
                        }
                    />
                ) : (
                    mostrador.map((grupo) => (
                        <div key={grupo.slug} className="mt-14 first:mt-12">
                            <div className="flex items-center gap-4">
                                <h3 className="font-mono text-[11px] tracking-[0.2em] text-texto-suave uppercase">
                                    {grupo.nombre}
                                </h3>
                                <span
                                    className="h-px flex-1 bg-borde"
                                    aria-hidden="true"
                                />
                                <Link
                                    href={`/productos?categoria=${grupo.slug}`}
                                    className="text-xs font-medium text-texto-medio transition-colors hover:text-bordo"
                                >
                                    Ver solo {grupo.nombre.toLowerCase()}
                                </Link>
                            </div>

                            <div className="mt-6 grid auto-rows-fr gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {grupo.productos.map((producto) => (
                                    <div
                                        key={producto.id}
                                        className="h-full emerge"
                                    >
                                        <ProductCard
                                            product={producto}
                                            className="h-full"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </section>

            {/* Sobre la panadería */}
            <section
                id="sobre"
                className="grano relative scroll-mt-24 border-y border-borde bg-papel"
            >
                <div className="relative z-1 mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-16">
                    <div className="relative">
                        <FotoSitio
                            url={fotos.amasado}
                            label="amasado a mano"
                            ratio="4:3"
                            className="shadow-lg"
                        />
                        <p className="mt-6 max-w-xs border-l-2 border-dorado pl-5 font-display text-xl leading-snug text-texto italic lg:absolute lg:-bottom-14 lg:-left-6 lg:mt-0 lg:max-w-sm lg:border-l-0 lg:bg-papel lg:p-6 lg:pl-6 lg:shadow-alzado">
                            “Pensando siempre lo mejor para cada cliente.”
                        </p>
                    </div>

                    <div className="lg:pl-6">
                        <p className="font-mono text-[11px] tracking-[0.2em] text-texto-suave uppercase">
                            El obrador
                        </p>
                        <h2 className="mt-3 font-display text-seccion text-texto">
                            Una panadería familiar
                        </h2>

                        <div className="mt-6 grid gap-5 leading-relaxed text-texto-medio">
                            <p>
                                Fénix abrió el 8 de marzo de 2021 en Leones con
                                una idea simple: llevar el buen sabor artesanal
                                a cada rinconcito de tu hogar. Es una panadería
                                familiar, y así seguimos trabajando todos los
                                días.
                            </p>
                            <p>
                                Trabajamos con almacenes, kioscos, bares y
                                confiterías de Leones. Armá tu pedido, pedinos
                                los precios y coordinamos cantidades y entregas
                                por WhatsApp.
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
                    <EnlaceAncla href="/#mostrador">
                        <Button size="lg">Empezar el pedido</Button>
                    </EnlaceAncla>
                </div>
            </section>

            {/* Ubicación */}
            <section
                id="ubicacion"
                className="grano relative scroll-mt-24 border-t border-borde bg-papel"
            >
                <div className="relative z-1 mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
                    <p className="font-mono text-[11px] tracking-[0.2em] text-texto-suave uppercase">
                        El local
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
