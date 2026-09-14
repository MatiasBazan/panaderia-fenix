import { createInertiaApp } from '@inertiajs/react';
import { ToastProvider } from '@/components/ui/toast';
import { appName } from '@/lib/app-name';

createInertiaApp({
    // La portada pasa el nombre de la app como título: ahí no se repite.
    title: (title) =>
        title && title !== appName ? `${title} · ${appName}` : appName,
    strictMode: true,
    withApp(app) {
        // Va por fuera de la app de Inertia: los toasts sobreviven al cambio de página.
        return <ToastProvider>{app}</ToastProvider>;
    },
    progress: {
        color: '#C79A3E',
    },
});
