import { Form, Head } from '@inertiajs/react';
import { KeyRound } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import AuthLayout from '@/layouts/auth-layout';

type Props = {
    passwordRules?: string;
};

export default function ForcedPassword({ passwordRules }: Props) {
    return (
        <AuthLayout title="Cambiá tu clave temporal">
            <Head title="Cambiar la clave" />

            <p className="mb-5 flex items-start gap-2 rounded-md border border-borde bg-crema px-3 py-2 text-sm text-texto-medio">
                <KeyRound
                    className="mt-0.5 size-4 shrink-0 text-alerta"
                    aria-hidden="true"
                />
                <span>
                    Entraste con la clave que te mandamos por mail. Elegí una
                    propia para continuar.
                </span>
            </p>

            <Form
                action="/cambiar-clave"
                method="put"
                className="flex flex-col gap-4"
            >
                {({ processing, errors }) => (
                    <>
                        <Input
                            label="Clave temporal"
                            type="password"
                            name="current_password"
                            required
                            autoFocus
                            autoComplete="current-password"
                            error={errors.current_password}
                        />

                        <Input
                            label="Clave nueva"
                            type="password"
                            name="password"
                            required
                            autoComplete="new-password"
                            hint={passwordRules}
                            error={errors.password}
                        />

                        <Input
                            label="Repetir la clave nueva"
                            type="password"
                            name="password_confirmation"
                            required
                            autoComplete="new-password"
                            error={errors.password_confirmation}
                        />

                        <Button
                            type="submit"
                            loading={processing}
                            block
                            className="mt-2"
                        >
                            {processing ? 'Guardando…' : 'Guardar y continuar'}
                        </Button>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
