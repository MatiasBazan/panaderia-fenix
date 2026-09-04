import { Check, Copy, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Button, useToast } from '@/components/ui';
import type { ConfigImagen } from './producto-form';

/**
 * Instrucción lista para pegarle a una IA de imágenes junto con la foto del
 * producto. Está acá y no en un documento aparte porque el momento en que hace
 * falta es justo este: cuando se está por subir la foto.
 *
 * El beige es el mismo `--color-crema` del sitio, así la foto recortada apoya
 * sobre el fondo del catálogo sin que se note el borde.
 */
export function promptFoto(imagen: ConfigImagen, nombre?: string): string {
    const producto = nombre?.trim()
        ? `El producto es: ${nombre.trim()}.`
        : 'El producto es el que aparece en la foto.';

    return `Editá esta foto para el catálogo de una panadería artesanal. ${producto}

FONDO
Reemplazá el fondo por un beige liso y cálido, color #F7F1E3. Sin texturas, sin degradados marcados, sin objetos ni superficies detrás.

PRODUCTO
Conservalo exactamente como está: forma, color, textura, migas, cortes, brillo del glaseado. No lo redibujes, no le agregues ni le quites partes, no cambies la cantidad de piezas ni la variedad.

LUZ
Luz suave y cálida entrando desde arriba a la izquierda, como la de una ventana. Sombra corta y difusa apoyada debajo del producto, en un beige más oscuro que el fondo. Sin reflejos duros ni luces de estudio.

ENCUADRE
Producto centrado, con aire alrededor (un 10% de margen). Proporción ${imagen.proporcion} horizontal, ${imagen.ancho_max}x${imagen.alto_sugerido} px como mínimo.

QUÉ NO QUIERO
Sin texto, sin logos, sin marcas de agua, sin manos, sin platos ni servilletas decorativas, sin filtros de color, sin viñeteado y sin fondo blanco puro.`;
}

export default function PromptFoto({
    nombre,
    imagen,
}: {
    nombre?: string;
    imagen: ConfigImagen;
}) {
    const { push } = useToast();
    const [copiado, setCopiado] = useState(false);
    const texto = promptFoto(imagen, nombre);

    const copiar = async () => {
        try {
            await navigator.clipboard.writeText(texto);
            setCopiado(true);
            push('exito', 'Prompt copiado');
            window.setTimeout(() => setCopiado(false), 2000);
        } catch {
            // Sin permiso de portapapeles queda el texto a la vista para
            // seleccionarlo a mano: nunca se pierde el acceso al prompt.
            push(
                'alerta',
                'No pudimos copiarlo. Seleccioná el texto y copialo.',
            );
        }
    };

    return (
        <details className="group rounded-lg bg-crema/60 ring-1 ring-borde">
            <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-medium text-texto marker:hidden">
                <Sparkles
                    className="size-4 shrink-0 text-dorado-hover"
                    aria-hidden="true"
                />
                Pasar la foto a fondo beige con IA
                <span className="ml-auto font-mono text-[11px] tracking-[0.14em] text-texto-suave uppercase">
                    {/* El estado del acordeón se dice con texto, no con una flecha sola. */}
                    <span className="group-open:hidden">Ver</span>
                    <span className="hidden group-open:inline">Ocultar</span>
                </span>
            </summary>

            <div className="border-t border-borde px-4 py-4">
                <p className="text-sm leading-relaxed text-texto-medio">
                    Subí la foto del producto a la IA de imágenes que uses y
                    pegale este texto. Devuelve la misma foto sobre el beige del
                    catálogo, en {imagen.proporcion}.
                </p>

                <pre className="mt-4 max-h-64 overflow-auto rounded-md bg-papel p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap text-texto ring-1 ring-borde">
                    {texto}
                </pre>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={copiar}
                        icon={
                            copiado ? (
                                <Check
                                    className="size-4 text-exito"
                                    aria-hidden="true"
                                />
                            ) : (
                                <Copy className="size-4" aria-hidden="true" />
                            )
                        }
                    >
                        {copiado ? 'Copiado' : 'Copiar prompt'}
                    </Button>
                    <p className="text-xs text-texto-medio">
                        Después subí el resultado acá arriba.
                    </p>
                </div>
            </div>
        </details>
    );
}
