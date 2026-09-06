import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import Field, { controlClass } from './field';
import type { FieldProps } from './field';

type Props = Pick<FieldProps, 'label' | 'hint' | 'error' | 'required'> & {
    /** Fecha en formato ISO `yyyy-mm-dd`. Vacío = sin elegir. */
    value?: string;
    onChange?: (value: string) => void;
    /** Primer día seleccionable, ISO `yyyy-mm-dd`. Los anteriores quedan grises. */
    min?: string;
    className?: string;
    disabled?: boolean;
};

const MESES = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
];

const DIAS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

/** ISO `yyyy-mm-dd` → Date local (sin corrimiento de zona horaria). */
function desdeISO(iso: string): Date | null {
    const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);

    if (!partes) {
        return null;
    }

    return new Date(Number(partes[1]), Number(partes[2]) - 1, Number(partes[3]));
}

function aISO(fecha: Date): string {
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');

    return `${fecha.getFullYear()}-${mes}-${dia}`;
}

function mismoDia(a: Date, b: Date): boolean {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

/**
 * Calendario propio en un menú flotante. Muestra la fecha como dd/mm/aaaa y al
 * abrirse deja elegir el día en una grilla con la piel de la marca — en vez del
 * `dd/mm/aaaa` gris del navegador, que cambiaba de aspecto en cada sistema.
 */
export default function DatePicker({
    label,
    hint,
    error,
    required,
    value = '',
    onChange,
    min,
    className,
    disabled,
}: Props) {
    const elegida = useMemo(() => desdeISO(value), [value]);
    const minimo = useMemo(() => (min ? desdeISO(min) : null), [min]);
    const hoy = useMemo(() => new Date(), []);

    const [abierto, setAbierto] = useState(false);
    // Mes que se está mirando; arranca en el de la fecha elegida o el actual.
    const [cursor, setCursor] = useState(() => elegida ?? hoy);
    const raiz = useRef<HTMLDivElement>(null);

    // Al reabrir, plantarse en el mes de lo ya elegido.
    useEffect(() => {
        if (abierto) {
            setCursor(elegida ?? hoy);
        }
    }, [abierto, elegida, hoy]);

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

    const anio = cursor.getFullYear();
    const mes = cursor.getMonth();

    // Celdas de la grilla: huecos antes del día 1 (semana arranca lunes) + días.
    const celdas = useMemo(() => {
        const primero = new Date(anio, mes, 1);
        const arranque = (primero.getDay() + 6) % 7;
        const cantidad = new Date(anio, mes + 1, 0).getDate();

        const lista: (Date | null)[] = Array.from(
            { length: arranque },
            () => null,
        );

        for (let dia = 1; dia <= cantidad; dia++) {
            lista.push(new Date(anio, mes, dia));
        }

        return lista;
    }, [anio, mes]);

    const deshabilitada = (fecha: Date) =>
        minimo !== null && fecha < minimo && !mismoDia(fecha, minimo);

    const elegir = (fecha: Date) => {
        if (deshabilitada(fecha)) {
            return;
        }

        onChange?.(aISO(fecha));
        setAbierto(false);
    };

    const texto = elegida
        ? `${String(elegida.getDate()).padStart(2, '0')}/${String(
              elegida.getMonth() + 1,
          ).padStart(2, '0')}/${elegida.getFullYear()}`
        : 'dd/mm/aaaa';

    return (
        <Field label={label} hint={hint} error={error} required={required}>
            {({ id, describedBy, invalid }) => (
                <div className="relative" ref={raiz}>
                    <button
                        type="button"
                        id={id}
                        aria-haspopup="dialog"
                        aria-expanded={abierto}
                        aria-describedby={describedBy}
                        aria-invalid={invalid || undefined}
                        disabled={disabled}
                        onClick={() => !disabled && setAbierto((v) => !v)}
                        className={cn(
                            controlClass(invalid),
                            'flex h-10 items-center justify-between gap-2 pr-3 text-left',
                            abierto && !invalid && 'ring-dorado',
                            className,
                        )}
                    >
                        <span className={elegida ? 'text-texto' : 'text-texto-suave'}>
                            {texto}
                        </span>
                        <CalendarDays
                            className="size-4 shrink-0 text-texto-medio"
                            aria-hidden="true"
                        />
                    </button>

                    {abierto && (
                        <div
                            role="dialog"
                            aria-label="Elegí una fecha"
                            className="absolute z-20 mt-1.5 w-72 origin-top animate-desplegar rounded-xl bg-papel p-3 shadow-lg ring-1 ring-borde"
                        >
                            <div className="mb-2 flex items-center justify-between">
                                <button
                                    type="button"
                                    aria-label="Mes anterior"
                                    onClick={() => setCursor(new Date(anio, mes - 1, 1))}
                                    className="rounded-md p-1.5 text-texto-medio transition-colors hover:bg-crema hover:text-texto"
                                >
                                    <ChevronLeft className="size-4" aria-hidden="true" />
                                </button>
                                <span className="text-sm font-medium text-texto">
                                    {MESES[mes]} {anio}
                                </span>
                                <button
                                    type="button"
                                    aria-label="Mes siguiente"
                                    onClick={() => setCursor(new Date(anio, mes + 1, 1))}
                                    className="rounded-md p-1.5 text-texto-medio transition-colors hover:bg-crema hover:text-texto"
                                >
                                    <ChevronRight className="size-4" aria-hidden="true" />
                                </button>
                            </div>

                            <div className="grid grid-cols-7 gap-0.5">
                                {DIAS.map((dia) => (
                                    <span
                                        key={dia}
                                        className="py-1 text-center text-xs font-medium text-texto-suave"
                                    >
                                        {dia}
                                    </span>
                                ))}

                                {celdas.map((fecha, indice) => {
                                    if (fecha === null) {
                                        return <span key={`v-${indice}`} />;
                                    }

                                    const sel = elegida !== null && mismoDia(fecha, elegida);
                                    const esHoy = mismoDia(fecha, hoy);
                                    const off = deshabilitada(fecha);

                                    return (
                                        <button
                                            key={aISO(fecha)}
                                            type="button"
                                            disabled={off}
                                            aria-pressed={sel}
                                            onClick={() => elegir(fecha)}
                                            className={cn(
                                                'flex h-9 items-center justify-center rounded-md text-sm transition-colors',
                                                sel &&
                                                    'bg-dorado font-medium text-white hover:bg-dorado',
                                                !sel &&
                                                    !off &&
                                                    'text-texto hover:bg-crema',
                                                !sel &&
                                                    esHoy &&
                                                    'font-medium text-dorado',
                                                off &&
                                                    'cursor-not-allowed text-texto-suave opacity-50',
                                            )}
                                        >
                                            {fecha.getDate()}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </Field>
    );
}
