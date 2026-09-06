import { cn } from '@/lib/utils';
import type { VarianteGrupo } from '@/lib/pedido';

type Props = {
    grupos: VarianteGrupo[];
    /** Label elegido en cada grupo, por índice. */
    seleccion: string[];
    onElegir: (indiceGrupo: number, label: string) => void;
    className?: string;
};

/**
 * Elige la variante de un producto: un grupo de «pills» por cada eje (sabor,
 * tamaño). Con pocas opciones se leen todas de un vistazo, mejor que esconderlas
 * en un desplegable. La elección la maneja el que lo usa, para poder calcular con
 * ella la línea del pedido.
 */
export default function VarianteSelector({
    grupos,
    seleccion,
    onElegir,
    className,
}: Props) {
    if (grupos.length === 0) {
        return null;
    }

    return (
        <div className={cn('grid gap-3', className)}>
            {grupos.map((grupo, indiceGrupo) => (
                <div key={grupo.nombre} className="grid gap-1.5">
                    <span className="font-mono text-[10px] tracking-[0.16em] text-texto-suave uppercase">
                        {grupo.nombre}
                    </span>
                    <div
                        role="radiogroup"
                        aria-label={grupo.nombre}
                        className="flex flex-wrap gap-2"
                    >
                        {grupo.opciones.map((opcion) => {
                            const activa = seleccion[indiceGrupo] === opcion.label;

                            return (
                                <button
                                    key={opcion.label}
                                    type="button"
                                    role="radio"
                                    aria-checked={activa}
                                    onClick={() =>
                                        onElegir(indiceGrupo, opcion.label)
                                    }
                                    className={cn(
                                        'rounded-full px-3 py-1.5 text-sm ring-1 transition-[background-color,color,box-shadow] duration-200 ease-suave',
                                        activa
                                            ? 'bg-carbon text-crema ring-carbon'
                                            : 'bg-papel text-texto-medio ring-borde hover:text-texto hover:ring-dorado',
                                    )}
                                >
                                    {opcion.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
