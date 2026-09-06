import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import Field, { controlClass } from './field';
import type { FieldProps } from './field';

export type SelectOption = {
    value: string;
    label: string;
    disabled?: boolean;
};

type Props = Pick<FieldProps, 'label' | 'hint' | 'error' | 'required'> & {
    options: SelectOption[];
    /** Texto cuando no hay nada elegido; también es la opción que vacía el valor. */
    placeholder?: string;
    /** Controlado si viene; si no, el componente se maneja solo. */
    value?: string;
    className?: string;
    disabled?: boolean;
    /**
     * Compatible con el `<select>` nativo: recibe algo con `target.value`, así los
     * llamadores siguen escribiendo `onChange={(e) => setX(e.target.value)}`.
     */
    onChange?: (event: { target: { value: string } }) => void;
};

/**
 * Select propio con la piel del sistema. Cerrado parece un input más; abierto
 * despliega un menú flotante con el elegido marcado, navegación por teclado y
 * cierre al tocar afuera. Se dejó de usar el `<select>` nativo para que el menú
 * combine con la marca en vez de heredar el gris del sistema operativo.
 */
export default function Select({
    label,
    hint,
    error,
    required,
    options,
    placeholder,
    value,
    className,
    disabled,
    onChange,
}: Props) {
    const controlado = value !== undefined;
    const [interno, setInterno] = useState('');
    const actual = controlado ? value : interno;

    const [abierto, setAbierto] = useState(false);
    const [marcado, setMarcado] = useState(-1);
    const raiz = useRef<HTMLDivElement>(null);
    const listaId = useId();

    const elegida = options.find((option) => option.value === actual);
    const texto = elegida?.label ?? placeholder ?? 'Elegí una opción';

    // Cerrar al tocar afuera o al perder el foco del conjunto.
    useEffect(() => {
        if (!abierto) {
            return;
        }

        const alTocar = (event: MouseEvent) => {
            if (!raiz.current?.contains(event.target as Node)) {
                setAbierto(false);
            }
        };

        document.addEventListener('mousedown', alTocar);

        return () => document.removeEventListener('mousedown', alTocar);
    }, [abierto]);

    const elegir = (opcion: SelectOption) => {
        if (opcion.disabled) {
            return;
        }

        if (!controlado) {
            setInterno(opcion.value);
        }

        onChange?.({ target: { value: opcion.value } });
        setAbierto(false);
    };

    const abrir = () => {
        if (disabled) {
            return;
        }

        const desde = options.findIndex((option) => option.value === actual);
        setMarcado(desde);
        setAbierto(true);
    };

    // Salta al siguiente/anterior habilitado; envuelve en los extremos.
    const mover = (paso: 1 | -1) => {
        setMarcado((previo) => {
            const total = options.length;

            for (let i = 1; i <= total; i++) {
                const siguiente = (previo + paso * i + total * i) % total;

                if (!options[siguiente]?.disabled) {
                    return siguiente;
                }
            }

            return previo;
        });
    };

    const alTeclado = (event: React.KeyboardEvent) => {
        if (disabled) {
            return;
        }

        switch (event.key) {
            case 'Enter':
            case ' ':
                event.preventDefault();

                if (abierto && options[marcado]) {
                    elegir(options[marcado]);
                } else {
                    abrir();
                }

                break;
            case 'ArrowDown':
                event.preventDefault();
                abierto ? mover(1) : abrir();
                break;
            case 'ArrowUp':
                event.preventDefault();
                abierto ? mover(-1) : abrir();
                break;
            case 'Escape':
                setAbierto(false);
                break;
            case 'Tab':
                setAbierto(false);
                break;
        }
    };

    return (
        <Field label={label} hint={hint} error={error} required={required}>
            {({ id, describedBy, invalid }) => (
                <div className="relative" ref={raiz}>
                    <button
                        type="button"
                        id={id}
                        role="combobox"
                        aria-haspopup="listbox"
                        aria-expanded={abierto}
                        aria-controls={listaId}
                        aria-describedby={describedBy}
                        aria-invalid={invalid || undefined}
                        disabled={disabled}
                        onClick={() => (abierto ? setAbierto(false) : abrir())}
                        onKeyDown={alTeclado}
                        className={cn(
                            controlClass(invalid),
                            'flex h-10 items-center justify-between gap-2 pr-3 text-left',
                            abierto && !invalid && 'ring-dorado',
                            className,
                        )}
                    >
                        <span
                            className={cn(
                                'truncate',
                                elegida ? 'text-texto' : 'text-texto-suave',
                            )}
                        >
                            {texto}
                        </span>
                        <ChevronDown
                            className={cn(
                                'size-4 shrink-0 text-texto-medio transition-transform duration-200 ease-suave',
                                abierto && 'rotate-180',
                            )}
                            aria-hidden="true"
                        />
                    </button>

                    {abierto && (
                        <ul
                            id={listaId}
                            role="listbox"
                            className={cn(
                                'absolute z-20 mt-1.5 max-h-64 w-full overflow-auto rounded-lg bg-papel p-1 shadow-lg ring-1 ring-borde',
                                'origin-top animate-desplegar',
                            )}
                        >
                            {placeholder && (
                                <Opcion
                                    label={placeholder}
                                    elegida={actual === ''}
                                    marcada={marcado === -1}
                                    silenciada
                                    onClick={() =>
                                        elegir({ value: '', label: placeholder })
                                    }
                                    onHover={() => setMarcado(-1)}
                                />
                            )}
                            {options.map((option, indice) => (
                                <Opcion
                                    key={option.value}
                                    label={option.label}
                                    elegida={option.value === actual}
                                    marcada={indice === marcado}
                                    disabled={option.disabled}
                                    onClick={() => elegir(option)}
                                    onHover={() => setMarcado(indice)}
                                />
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </Field>
    );
}

type OpcionProps = {
    label: string;
    elegida: boolean;
    marcada: boolean;
    disabled?: boolean;
    silenciada?: boolean;
    onClick: () => void;
    onHover: () => void;
};

function Opcion({
    label,
    elegida,
    marcada,
    disabled,
    silenciada,
    onClick,
    onHover,
}: OpcionProps) {
    return (
        <li
            role="option"
            aria-selected={elegida}
            aria-disabled={disabled || undefined}
            onMouseDown={(event) => event.preventDefault()}
            onClick={onClick}
            onMouseEnter={onHover}
            className={cn(
                'flex cursor-pointer items-center justify-between gap-2 rounded-md px-3 py-2 text-sm',
                marcada && !disabled && 'bg-crema',
                elegida ? 'font-medium text-texto' : 'text-texto-medio',
                silenciada && !elegida && 'text-texto-suave',
                disabled && 'cursor-not-allowed text-texto-suave opacity-60',
            )}
        >
            <span className="truncate">{label}</span>
            {elegida && (
                <Check className="size-4 shrink-0 text-dorado" aria-hidden="true" />
            )}
        </li>
    );
}
