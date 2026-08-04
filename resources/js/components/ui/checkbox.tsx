import { useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'id'> & {
    label: ReactNode;
    hint?: ReactNode;
};

export default function Checkbox({ label, hint, className, ...props }: Props) {
    const id = useId();

    return (
        <div className="flex items-start gap-2.5">
            <input
                id={id}
                type="checkbox"
                className={cn(
                    'mt-0.5 size-4 shrink-0 rounded-sm border border-borde bg-papel accent-dorado',
                    className,
                )}
                {...props}
            />
            <div className="grid gap-0.5">
                <label htmlFor={id} className="text-sm text-texto">
                    {label}
                </label>
                {hint && <p className="text-sm text-texto-suave">{hint}</p>}
            </div>
        </div>
    );
}
