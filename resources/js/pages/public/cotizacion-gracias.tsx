import { Head, Link } from '@inertiajs/react';
import { CircleCheck, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui';
import PublicLayout from '@/layouts/public-layout';

type Props = {
    /** False si alguien entró directo a la URL sin haber enviado nada. */
    enviada: boolean;
    panaderia: { telefono?: string; email?: string };
};

export default function CotizacionGracias({ enviada, panaderia }: Props) {
    return (
        <PublicLayout hideQuoteBar>
            <Head title="Solicitud enviada" />

            <div className="mx-auto max-w-2xl px-4 py-16 text-center">
                {enviada ? (
                    <>
                        <CircleCheck
                            className="mx-auto size-12 text-exito"
                            aria-hidden="true"
                        />
                        <h1 className="mt-6 font-display text-4xl leading-tight text-texto">
                            Recibimos tu solicitud
                        </h1>
                        <p className="mt-4 text-lg text-texto-medio">
                            La estamos revisando. Te respondemos con los precios
                            dentro de las 24 horas hábiles, al correo que nos
                            dejaste.
                        </p>
                    </>
                ) : (
                    <>
                        <h1 className="font-display text-4xl leading-tight text-texto">
                            Acá no hay nada todavía
                        </h1>
                        <p className="mt-4 text-lg text-texto-medio">
                            Esta pantalla aparece después de enviar una
                            solicitud de cotización.
                        </p>
                    </>
                )}

                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <Link href="/productos">
                        <Button size="lg">Volver al catálogo</Button>
                    </Link>
                    <Link href="/">
                        <Button size="lg" variant="secondary">
                            Ir al inicio
                        </Button>
                    </Link>
                </div>

                {enviada && (panaderia.telefono || panaderia.email) && (
                    <div className="mt-12 rounded-lg border border-borde bg-papel p-5 text-left">
                        <p className="text-sm font-semibold text-texto">
                            ¿Es urgente?
                        </p>
                        <p className="mt-1 text-sm text-texto-medio">
                            Escribinos o llamanos y lo vemos en el momento.
                        </p>
                        <div className="mt-3 grid gap-2 text-sm">
                            {panaderia.telefono && (
                                <a
                                    href={`tel:${panaderia.telefono.replace(/[^\d+]/g, '')}`}
                                    className="flex items-center gap-2 font-mono text-texto underline underline-offset-4 hover:text-bordo"
                                >
                                    <Phone
                                        className="size-4 shrink-0 text-dorado"
                                        aria-hidden="true"
                                    />
                                    {panaderia.telefono}
                                </a>
                            )}
                            {panaderia.email && (
                                <a
                                    href={`mailto:${panaderia.email}`}
                                    className="flex items-center gap-2 text-texto underline underline-offset-4 hover:text-bordo"
                                >
                                    <Mail
                                        className="size-4 shrink-0 text-dorado"
                                        aria-hidden="true"
                                    />
                                    {panaderia.email}
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
