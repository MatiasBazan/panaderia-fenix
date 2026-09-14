<?php

use App\Http\Middleware\EnsurePasswordChanged;
use App\Http\Middleware\EnsureUserHasRole;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Detrás del Caddy compartido: confiamos en sus cabeceras X-Forwarded-*
        // para detectar HTTPS y la IP real. Solo Caddy alcanza a nginx por la
        // red interna, así que confiar en cualquier proxy es seguro acá.
        $middleware->trustProxies(at: '*');

        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'role' => EnsureUserHasRole::class,
            'password.changed' => EnsurePasswordChanged::class,
        ]);

        // Quien ya tiene sesión y entra a /login (el enlace «Administración» del
        // footer) va a su panel, el mismo destino que después de ingresar. Sin
        // esto Laravel lo mandaba a la portada.
        $middleware->redirectUsersTo(
            fn (Request $request): string => $request->user()?->role->homeRoute() ?? '/',
        );
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
