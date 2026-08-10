import { Head, Link } from '@inertiajs/react';
import { CircleCheck, Mail, MessageCircle, Phone } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/components/ui';
import PublicLayout from '@/layouts/public-layout';

type Props = {
    /** False si alguien entró directo a la URL sin haber enviado nada. */
    enviada: boolean;
    panaderia: { telefono?: string; email?: string };
    /** Contacto de la panadería que atiende el pedido (Nati o Juan). */
    contacto: string | null;
    /** Enlace wa.me con el pedido precargado hacia el contacto. Null si no hay número. */
    whatsappUrl: string | null;
};

export default function CotizacionGracias({
    enviada,
    panaderia,
    contacto,
    whatsappUrl,
}: Props) {
    // Apenas se envía, abrimos el chat con el pedido ya escrito, listo para mandar.
    useEffect(() => {
        if (enviada && whatsappUrl) {
            window.location.href = whatsappUrl;
        }
    }, [enviada, whatsappUrl]);

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
                        {whatsappUrl ? (
                            <p className="mt-4 text-lg text-texto-medio">
                                Te estamos abriendo WhatsApp
                                {contacto ? ` con ${contacto}` : ''} con tu
                                pedido ya escrito. Solo tenés que tocar enviar.
                            </p>
                        ) : (
                            <p className="mt-4 text-lg text-texto-medio">
                                La estamos revisando y te respondemos con los
                                precios a la brevedad.
                            </p>
                        )}
                    </>
                ) : (
                    <>
                        <CircleCheck
                            className="mx-auto size-12 text-exito"
                            aria-hidden="true"
                        />
                        <h1 className="mt-6 font-display text-4xl leading-tight text-texto">
                            ¡Gracias por tu pedido!
                        </h1>
                        <p className="mt-4 text-lg text-texto-medio">
                            En las próximas horas vas a recibir la cotización.
                        </p>
                    </>
                )}

                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    {enviada && whatsappUrl && (
                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button
                                size="lg"
                                icon={
                                    <MessageCircle
                                        className="size-5"
                                        aria-hidden="true"
                                    />
                                }
                            >
                                ¿No se abrió? Abrir WhatsApp
                            </Button>
                        </a>
                    )}
                    <Link href="/productos">
                        <Button
                            size="lg"
                            variant={
                                enviada && whatsappUrl ? 'secondary' : 'primary'
                            }
                        >
                            Volver al catálogo
                        </Button>
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
