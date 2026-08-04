import { Form, Head } from '@inertiajs/react';
import { Button, Input } from '@/components/ui';
import AuthLayout from '@/layouts/auth-layout';

type Props = {
    email: string;
    token: string;
    passwordRules?: string;
};

export default function ResetPassword({ email, token, passwordRules }: Props) {
    return (
        <AuthLayout title="Elegir una clave nueva" description={email}>
            <Head title="Elegir una clave nueva" />

            <Form
                action="/reset-password"
                method="post"
                transform={(data) => ({ ...data, token, email })}
                className="flex flex-col gap-4"
            >
                {({ processing, errors }) => (
                    <>
                        <Input
                            label="Clave nueva"
                            type="password"
                            name="password"
                            required
                            autoFocus
                            autoComplete="new-password"
                            hint={passwordRules}
                            error={errors.password ?? errors.email}
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
                            {processing ? 'Guardando…' : 'Guardar la clave'}
                        </Button>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
