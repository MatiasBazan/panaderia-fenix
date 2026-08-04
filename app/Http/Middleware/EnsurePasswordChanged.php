<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Un comercio dado de alta con clave temporal no puede navegar el portal
 * hasta cambiarla.
 */
class EnsurePasswordChanged
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user?->must_change_password && ! $request->routeIs('password.forzado.*')) {
            return redirect()->route('password.forzado.edit');
        }

        return $next($request);
    }
}
