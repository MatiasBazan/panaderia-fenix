import { Form, Head, Link } from '@inertiajs/react';
import { Info } from 'lucide-react';
import { Button, Checkbox, Input } from '@/components/ui';
import AuthLayout from '@/layouts/auth-layout';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <AuthLayout
            title="Ingresar"
            description="Acceso para comercios y administración de la panadería."
        >
            <Head title="Ingresar" />

            {status && (
                <p className="mb-4 flex items-start gap-2 rounded-md border border-borde bg-crema px-3 py-2 text-sm text-texto-medio">
                    <Info
                        className="mt-0.5 size-4 shrink-0 text-info"
                        aria-hidden="true"
                    />
                    <span>{status}</span>
                </p>
            )}

            <Form
                action="/login"
                method="post"
                resetOnSuccess={['password']}
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
                            placeholder="nombre@comercio.com.ar"
                            error={errors.email}
                        />

                        <div className="grid gap-1.5">
                            <Input
                                label="Clave"
                                type="password"
                                name="password"
                                required
                                autoComplete="current-password"
                                error={errors.password}
                            />
                            {canResetPassword && (
                                <Link
                                    href="/forgot-password"
                                    className="justify-self-end text-sm text-texto-medio underline underline-offset-4 hover:text-bordo"
                                >
                                    ¿Olvidaste la clave?
                                </Link>
                            )}
                        </div>

                        <Checkbox
                            name="remember"
                            label="Mantener la sesión iniciada"
                        />

                        <Button
                            type="submit"
                            loading={processing}
                            block
                            className="mt-2"
                        >
                            {processing ? 'Ingresando…' : 'Ingresar'}
                        </Button>
                    </>
                )}
            </Form>

            <p className="mt-6 border-t border-borde pt-4 text-sm text-texto-medio">
                ¿Todavía no sos cliente mayorista?{' '}
                <Link
                    href="/comercios/solicitar"
                    className="text-bordo underline underline-offset-4 hover:text-bordo-hover"
                >
                    Pedí el alta
                </Link>
                .
            </p>
        </AuthLayout>
    );
}
