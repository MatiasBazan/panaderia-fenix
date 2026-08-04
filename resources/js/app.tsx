import { createInertiaApp } from '@inertiajs/react';
import { ToastProvider } from '@/components/ui/toast';

const appName = import.meta.env.VITE_APP_NAME || 'Panadería Fénix';

createInertiaApp({
    title: (title) => (title ? `${title} · ${appName}` : appName),
    strictMode: true,
    withApp(app) {
        // Va por fuera de la app de Inertia: los toasts sobreviven al cambio de página.
        return <ToastProvider>{app}</ToastProvider>;
    },
    progress: {
        color: '#C79A3E',
    },
});
