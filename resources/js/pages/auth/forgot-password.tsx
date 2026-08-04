import { Form, Head, Link } from '@inertiajs/react';
import { CircleCheck } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import AuthLayout from '@/layouts/auth-layout';

type Props = {
    status?: string;
};

export default function ForgotPassword({ status }: Props) {
    return (
        <AuthLayout
            title="Recuperar la clave"
            description="Te mandamos un enlace para elegir una nueva."
        >
            <Head title="Recuperar la clave" />

            {status && (
                <p className="mb-4 flex items-start gap-2 rounded-md border border-borde bg-crema px-3 py-2 text-sm text-texto-medio">
                    <CircleCheck
                        className="mt-0.5 size-4 shrink-0 text-exito"
                        aria-hidden="true"
                    />
                    <span>{status}</span>
                </p>
            )}

            <Form
                action="/forgot-password"
                method="post"
                className="flex flex-col gap-4"
            >
                {({ processing, errors }) => (
                    <>
                        <Input
                            label="Correo electrónico"
                            type="email"
                            name="email"
                            required
                            autoFocus
                            autoComplete="email"
                            error={errors.email}
                        />

                        <Button
                            type="submit"
                            loading={processing}
                            block
                            className="mt-2"
                        >
                            {processing ? 'Enviando…' : 'Enviar enlace'}
                        </Button>
                    </>
                )}
            </Form>

            <p className="mt-6 text-sm text-texto-medio">
                <Link
                    href="/login"
                    className="underline underline-offset-4 hover:text-bordo"
                >
                    Volver a ingresar
                </Link>
            </p>
        </AuthLayout>
    );
}
