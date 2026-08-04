import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import Field, { controlClass } from './field';
import type { FieldProps } from './field';

type FieldShell = Pick<FieldProps, 'label' | 'hint' | 'error' | 'required'>;

type InputProps = FieldShell &
    Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
        /** Usa JetBrains Mono: para SKU, CUIT, montos y números de documento. */
        mono?: boolean;
    };

export default function Input({
    label,
    hint,
    error,
    required,
    mono = false,
    className,
    ...props
}: InputProps) {
    return (
        <Field label={label} hint={hint} error={error} required={required}>
            {({ id, describedBy, invalid }) => (
                <input
                    id={id}
                    aria-describedby={describedBy}
                    aria-invalid={invalid || undefined}
                    required={required}
                    className={cn(controlClass(invalid), 'h-10', mono && 'font-mono', className)}
                    {...props}
                />
            )}
        </Field>
    );
}

type TextareaProps = FieldShell & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'>;

export function Textarea({
    label,
    hint,
    error,
    required,
    className,
    rows = 4,
    ...props
}: TextareaProps) {
    return (
        <Field label={label} hint={hint} error={error} required={required}>
            {({ id, describedBy, invalid }) => (
                <textarea
                    id={id}
                    rows={rows}
                    aria-describedby={describedBy}
                    aria-invalid={invalid || undefined}
                    required={required}
                    className={cn(controlClass(invalid), 'py-2 leading-relaxed', className)}
                    {...props}
                />
            )}
        </Field>
    );
}
