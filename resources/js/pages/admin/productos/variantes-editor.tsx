import { Plus, Trash2 } from 'lucide-react';
import { Button, controlClass } from '@/components/ui';
import { cn } from '@/lib/utils';

/** Opción de un grupo, tal como se edita: el precio viaja como texto del input. */
export type OpcionEdit = { label: string; precio: string };
export type GrupoEdit = { nombre: string; opciones: OpcionEdit[] };

type Props = {
    value: GrupoEdit[];
    onChange: (value: GrupoEdit[]) => void;
    /** Error general de las variantes, si el backend rechazó algo. */
    error?: string;
};

const grupoVacio = (): GrupoEdit => ({
    nombre: '',
    opciones: [{ label: '', precio: '' }],
});

const inputClass = cn(controlClass(), 'h-10');

/**
 * Edita los grupos de variantes de un producto: «Sabor» con membrillo / dulce de
 * leche / batata, «Tamaño» con grande / chico. El precio por opción es de
 * referencia interna y opcional — los sabores de la pastaflora lo dejan vacío.
 */
export default function VariantesEditor({ value, onChange, error }: Props) {
    const setGrupo = (indice: number, cambios: Partial<GrupoEdit>) =>
        onChange(
            value.map((grupo, i) =>
                i === indice ? { ...grupo, ...cambios } : grupo,
            ),
        );

    const setOpcion = (
        grupoIndice: number,
        opcionIndice: number,
        cambios: Partial<OpcionEdit>,
    ) =>
        setGrupo(grupoIndice, {
            opciones: value[grupoIndice].opciones.map((opcion, i) =>
                i === opcionIndice ? { ...opcion, ...cambios } : opcion,
            ),
        });

    const quitarGrupo = (indice: number) =>
        onChange(value.filter((_, i) => i !== indice));

    const agregarOpcion = (grupoIndice: number) =>
        setGrupo(grupoIndice, {
            opciones: [
                ...value[grupoIndice].opciones,
                { label: '', precio: '' },
            ],
        });

    const quitarOpcion = (grupoIndice: number, opcionIndice: number) =>
        setGrupo(grupoIndice, {
            opciones: value[grupoIndice].opciones.filter(
                (_, i) => i !== opcionIndice,
            ),
        });

    return (
        <div className="grid gap-3">
            <div>
                <span className="text-sm font-medium text-texto">
                    Variantes
                </span>
                <p className="text-xs text-texto-medio">
                    Opciones que el cliente elige sobre la misma foto (sabor,
                    tamaño). El precio por opción es de referencia interna y
                    opcional; no se muestra en el sitio.
                </p>
            </div>

            {value.map((grupo, grupoIndice) => (
                <div
                    key={grupoIndice}
                    className="grid gap-3 rounded-lg bg-crema/50 p-4 ring-1 ring-borde"
                >
                    <div className="flex items-end gap-2">
                        <label className="grid flex-1 gap-1.5">
                            <span className="text-sm font-medium text-texto">
                                Grupo
                            </span>
                            <input
                                className={inputClass}
                                placeholder="Ej. Sabor, Tamaño"
                                value={grupo.nombre}
                                onChange={(e) =>
                                    setGrupo(grupoIndice, {
                                        nombre: e.target.value,
                                    })
                                }
                            />
                        </label>
                        <Button
                            type="button"
                            variant="quiet"
                            onClick={() => quitarGrupo(grupoIndice)}
                            aria-label="Quitar grupo"
                        >
                            <Trash2 className="size-4" aria-hidden="true" />
                        </Button>
                    </div>

                    <div className="grid gap-2">
                        <div className="flex gap-2 text-xs font-medium text-texto-medio">
                            <span className="flex-1">Opción</span>
                            <span className="w-28">Precio ref.</span>
                            <span className="w-9" aria-hidden="true" />
                        </div>

                        {grupo.opciones.map((opcion, opcionIndice) => (
                            <div
                                key={opcionIndice}
                                className="flex items-center gap-2"
                            >
                                <input
                                    className={cn(inputClass, 'flex-1')}
                                    placeholder="Ej. Membrillo"
                                    aria-label="Opción"
                                    value={opcion.label}
                                    onChange={(e) =>
                                        setOpcion(grupoIndice, opcionIndice, {
                                            label: e.target.value,
                                        })
                                    }
                                />
                                <input
                                    className={cn(inputClass, 'w-28 font-mono')}
                                    type="number"
                                    step="0.01"
                                    min={0}
                                    placeholder="—"
                                    aria-label="Precio de referencia (opcional)"
                                    value={opcion.precio}
                                    onChange={(e) =>
                                        setOpcion(grupoIndice, opcionIndice, {
                                            precio: e.target.value,
                                        })
                                    }
                                />
                                <Button
                                    type="button"
                                    variant="quiet"
                                    onClick={() =>
                                        quitarOpcion(grupoIndice, opcionIndice)
                                    }
                                    aria-label="Quitar opción"
                                    disabled={grupo.opciones.length === 1}
                                >
                                    <Trash2
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                </Button>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={() => agregarOpcion(grupoIndice)}
                            className="mt-1 inline-flex w-fit items-center gap-1.5 text-sm text-bordo underline underline-offset-4 hover:text-carbon"
                        >
                            <Plus className="size-3.5" aria-hidden="true" />
                            Agregar opción
                        </button>
                    </div>
                </div>
            ))}

            {error && <p className="text-sm text-error">{error}</p>}

            <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-fit"
                icon={<Plus className="size-4" aria-hidden="true" />}
                onClick={() => onChange([...value, grupoVacio()])}
            >
                Agregar grupo de variantes
            </Button>
        </div>
    );
}
