<!--
    Pantalla de mantenimiento (503).

    La usan tres cosas: `php artisan down`, cualquier 503 de Laravel y — sobre
    todo — nginx mientras el contenedor de la app se recrea en el deploy. Por eso
    este archivo se copia tal cual a la imagen de nginx como
    public/mantenimiento.html: TIENE QUE SER HTML PLANO. Nada de directivas de
    Blade (ni siquiera adentro de este comentario: Blade las compila igual), nada
    de bundle de Vite, nada de CSS externo — cuando esta pantalla se muestra, PHP
    y los assets pueden no estar respondiendo. Lo único que pide es el logo, que
    nginx sirve desde public/.

    El meta refresh la reintenta sola: el deploy tarda menos que eso, así que el
    visitante vuelve al sitio sin tocar nada.
-->
<!DOCTYPE html>
<html lang="es">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="theme-color" content="#F7F1E3">
        <meta name="robots" content="noindex">
        <meta http-equiv="refresh" content="30">
        <title>Volvemos en unos minutos · Panadería Fénix</title>
        <link rel="icon" href="/favicon.ico" sizes="any">
        <style>
            :root {
                --crema: #f7f1e3;
                --papel: #fffcf5;
                --borde: #e5d9c3;
                --texto: #241e18;
                --texto-medio: #6a5f52;
                --texto-suave: #9b8f7e;
                --dorado: #c79a3e;
                --bordo: #9a3324;
            }

            * { box-sizing: border-box; }

            html { background-color: var(--crema); }

            body {
                margin: 0;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 24px;
                background-color: var(--crema);
                color: var(--texto);
                font-family: 'Work Sans', system-ui, -apple-system, 'Segoe UI', sans-serif;
                -webkit-font-smoothing: antialiased;
            }

            .tarjeta {
                width: 100%;
                max-width: 30rem;
                padding: 40px 32px;
                border: 1px solid var(--borde);
                border-radius: 14px;
                background-color: var(--papel);
                box-shadow: 0 18px 40px -28px rgba(36, 30, 24, 0.45);
                text-align: center;
            }

            .logo {
                width: 72px;
                height: 72px;
                margin: 0 auto 24px;
                display: block;
            }

            .rotulo {
                margin: 0;
                font-family: 'JetBrains Mono', ui-monospace, monospace;
                font-size: 10px;
                letter-spacing: 0.18em;
                text-transform: uppercase;
                color: var(--texto-suave);
            }

            h1 {
                margin: 12px 0 0;
                font-family: 'DM Serif Display', Georgia, serif;
                font-weight: 400;
                font-size: clamp(1.875rem, 1.4rem + 1.9vw, 2.5rem);
                line-height: 1.08;
                letter-spacing: -0.018em;
            }

            p {
                margin: 16px 0 0;
                font-size: 0.9375rem;
                line-height: 1.65;
                color: var(--texto-medio);
            }

            .filo {
                margin: 28px auto 0;
                width: 56px;
                height: 2px;
                background-color: var(--dorado);
                border-radius: 2px;
            }

            .pie {
                margin-top: 20px;
                font-size: 0.8125rem;
                color: var(--texto-suave);
            }

            .pie strong {
                color: var(--bordo);
                font-weight: 600;
            }
        </style>
    </head>
    <body>
        <main class="tarjeta">
            <img class="logo" src="/img/logo-192.png" alt="Panadería Fénix" width="72" height="72">

            <p class="rotulo">Panadería Fénix · Leones</p>

            <h1>Estamos actualizando el sitio</h1>

            <p>
                Volvemos en unos minutos. Esta página se recarga sola, así que
                podés dejarla abierta.
            </p>

            <div class="filo"></div>

            <p class="pie">
                Si necesitás hacer un pedido ahora, escribinos por
                <strong>WhatsApp</strong> y lo tomamos por ahí.
            </p>
        </main>
    </body>
</html>
