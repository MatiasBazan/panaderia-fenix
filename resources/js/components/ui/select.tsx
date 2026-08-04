import { ChevronDown } from 'lucide-react';
import type { SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import Field, { controlClass } from './field';
import type { FieldProps } from './field';

export type SelectOption = {
    value: string;
    label: string;
    disabled?: boolean;
};

type Props = Pick<FieldProps, 'label' | 'hint' | 'error' | 'required'> &
    Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id' | 'children'> & {
        options: SelectOption[];
        /** Opción vacía inicial; si falta, el select arranca en la primera opción. */
        placeholder?: string;
    };

/**
 * Select nativo con la piel del sistema. Nativo a propósito: en mobile abre el
 * picker del sistema operativo, que es lo que un comercio espera a las 6 AM.
 */
export default function Select({
    label,
    hint,
    error,
    required,
    options,
    placeholder,
    className,
    ...props
}: Props) {
    return (
        <Field label={label} hint={hint} error={error} required={required}>
            {({ id, describedBy, invalid }) => (
                <div className="relative">
                    <select
                        id={id}
                        aria-describedby={describedBy}
                        aria-invalid={invalid || undefined}
                        required={required}
                        className={cn(
                            controlClass(invalid),
                            'h-10 appearance-none pr-9',
                            className,
                        )}
                        {...props}
                    >
                        {placeholder && <option value="">{placeholder}</option>}
                        {options.map((option) => (
                            <option
                                key={option.value}
                                value={option.value}
                                disabled={option.disabled}
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown
                        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-texto-medio"
                        aria-hidden="true"
                    />
                </div>
            )}
        </Field>
    );
}
