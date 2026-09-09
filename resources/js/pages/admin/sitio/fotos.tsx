import { router, useForm } from '@inertiajs/react';
import { ImageOff, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button, Modal } from '@/components/ui';
import AdminLayout from '@/layouts/admin-layout';

type Hueco = {
    slot: string;
    label: string;
    ayuda: string;
    proporcion: string;
    ancho: number;
    url: string | null;
};

type Props = {
    huecos: Hueco[];
    /** Máximo real, ya acotado por php.ini. */
    peso_max_mb: string;
};

/**
 * Fotos de la landing, un hueco por tarjeta.
 *
 * Cada hueco sube por su cuenta y vuelve con `back()`: así una foto pesada que
 * falla no se lleva puestas las otras dos, y la panadería ve el resultado sin
 * cambiar de pantalla.
 */
export default function SitioFotos({ huecos, peso_max_mb }: Props) {
    const [aQuitar, setAQuitar] = useState<Hueco | null>(null);

    return (
        <AdminLayout
            eyebrow="Sitio"
            title="Fotos de la landing"
            description="Las fotos grandes de la página de inicio. Mientras un hueco esté vacío, el sitio muestra el placeholder rayado en su lugar."
        >
            <div className="grid gap-5 lg:grid-cols-2">
                {huecos.map((hueco) => (
                    <TarjetaHueco
                        key={hueco.slot}
                        hueco={hueco}
                        pesoMaxMb={peso_max_mb}
                        onQuitar={() => setAQuitar(hueco)}
                    />
                ))}
            </div>

            <Modal
                open={aQuitar !== null}
                onClose={() => setAQuitar(null)}
                title="Quitar la foto"
                description={
                    aQuitar === null
                        ? undefined
                        : `«${aQuitar.label}» vuelve a mostrarse como placeholder en la landing. El archivo se borra del servidor.`
                }
                footer={
                    <>
                        <Button
                            variant="secondary"
                            onClick={() => setAQuitar(null)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (aQuitar === null) {
                                    return;
                                }

                                router.delete(
                                    `/admin/sitio/fotos/${aQuitar.slot}`,
                                    { onFinish: () => setAQuitar(null) },
                                );
                            }}
                        >
                            Quitar la foto
                        </Button>
                    </>
                }
            />
        </AdminLayout>
    );
}

function TarjetaHueco({
    hueco,
    pesoMaxMb,
    onQuitar,
}: {
    hueco: Hueco;
    pesoMaxMb: string;
    onQuitar: () => void;
}) {
    const input = useRef<HTMLInputElement>(null);
    const form = useForm<{ imagen: File | null }>({ imagen: null });

    const subir = (archivo: File) => {
        // `transform` y no `setData`: el estado del form no llega a aplicarse
        // antes del post, y sin esto se subiría el archivo anterior o ninguno.
        form.transform(() => ({ imagen: archivo }));

        form.post(`/admin/sitio/fotos/${hueco.slot}`, {
            forceFormData: true,
            preserveScroll: true,
            onFinish: () => {
                if (input.current) {
                    input.current.value = '';
                }
            },
        });
    };

    return (
        <article className="overflow-hidden rounded-xl bg-papel shadow-xs ring-1 ring-borde">
            <div className="flex items-center justify-center bg-crema/60 p-4">
                {hueco.url ? (
                    <img
                        src={hueco.url}
                        alt={hueco.label}
                        className="max-h-56 w-auto rounded-lg object-contain ring-1 ring-borde"
                    />
                ) : (
                    <div className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-borde text-texto-suave">
                        <ImageOff className="size-6" aria-hidden="true" />
                        <span className="text-sm">Sin foto todavía</span>
                    </div>
                )}
            </div>

            <div className="grid gap-3 border-t border-borde p-5">
                <div>
                    <h2 className="font-display text-xl text-texto">
                        {hueco.label}
                    </h2>
                    <p className="mt-1 text-sm leading-relaxed text-texto-medio">
                        {hueco.ayuda}
                    </p>
                </div>

                <p className="font-mono text-[11px] tracking-[0.14em] text-texto-suave uppercase">
                    {hueco.proporcion} · ideal {hueco.ancho} px de ancho · JPG,
                    PNG o WEBP · hasta {pesoMaxMb} MB
                </p>

                <input
                    ref={input}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={(e) => {
                        const archivo = e.target.files?.[0];

                        if (archivo) {
                            subir(archivo);
                        }
                    }}
                />

                {form.errors.imagen && (
                    <p className="text-sm text-error">{form.errors.imagen}</p>
                )}

                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        icon={<Upload className="size-4" aria-hidden="true" />}
                        loading={form.processing}
                        onClick={() => input.current?.click()}
                    >
                        {hueco.url ? 'Cambiar foto' : 'Subir foto'}
                    </Button>

                    {hueco.url && (
                        <Button
                            variant="secondary"
                            icon={
                                <Trash2 className="size-4" aria-hidden="true" />
                            }
                            onClick={onQuitar}
                        >
                            Quitar
                        </Button>
                    )}
                </div>
            </div>
        </article>
    );
}
