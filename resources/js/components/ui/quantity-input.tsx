import { Minus, Plus } from 'lucide-react';
import { useId } from 'react';
import { cn } from '@/lib/utils';
import type { UnidadValue } from '@/lib/estados';

type Props = {
    value: number;
    onChange: (value: number) => void;
    /** Los kilos admiten fracciones; docenas y bandejas no. */
    unidad?: UnidadValue;
    min?: number;
    max?: number;
    label?: string;
    size?: 'sm' | 'md';
    className?: string;
    disabled?: boolean;
};

export default function QuantityInput({
    value,
    onChange,
    unidad = 'unidad',
    min = 0,
    max = 9999,
    label = 'Cantidad',
    size = 'md',
    className,
    disabled = false,
}: Props) {
    const id = useId();
    const step = unidad === 'kg' ? 0.5 : 1;
    const alto = size === 'sm' ? 'h-8' : 'h-10';
    const ancho = size === 'sm' ? 'w-12' : 'w-14';

    const clamp = (n: number) => Math.min(max, Math.max(min, Number(n.toFixed(2))));

    return (
        <div
            className={cn(
                'inline-flex items-stretch overflow-hidden rounded-md bg-papel ring-1 ring-borde',
                'transition-shadow duration-200 ease-suave focus-within:ring-dorado',
                alto,
                className,
            )}
        >
            <button
                type="button"
                onClick={() => onChange(clamp(value - step))}
                disabled={disabled || value <= min}
                aria-label={`Quitar ${step}`}
                aria-controls={id}
                className="px-2.5 text-texto-medio transition-colors duration-200 hover:bg-crema hover:text-texto active:bg-borde/60 disabled:opacity-40 disabled:hover:bg-transparent"
            >
                <Minus className="size-4" aria-hidden="true" />
            </button>

            <input
                id={id}
                type="number"
                inputMode={step === 1 ? 'numeric' : 'decimal'}
                value={value}
                min={min}
                max={max}
                step={step}
                disabled={disabled}
                aria-label={label}
                onChange={(event) => onChange(clamp(Number(event.target.value || 0)))}
                className={cn(
                    'border-x border-borde bg-papel text-center font-mono text-sm text-texto',
                    'focus:outline-none [&::-webkit-inner-spin-button]:appearance-none',
                    '[&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]',
                    ancho,
                )}
            />

            <button
                type="button"
                onClick={() => onChange(clamp(value + step))}
                disabled={disabled || value >= max}
                aria-label={`Agregar ${step}`}
                aria-controls={id}
                className="px-2.5 text-texto-medio transition-colors duration-200 hover:bg-crema hover:text-texto active:bg-borde/60 disabled:opacity-40 disabled:hover:bg-transparent"
            >
                <Plus className="size-4" aria-hidden="true" />
            </button>
        </div>
    );
}
