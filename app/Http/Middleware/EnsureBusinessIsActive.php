<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Un comercio suspendido, pendiente o rechazado no opera en el portal.
 * Se aplica a todo `/portal`.
 */
class EnsureBusinessIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $business = $request->user()?->business;

        if ($business === null) {
            abort(403, 'Tu usuario no está asociado a ningún comercio.');
        }

        if (! $business->puedeOperar()) {
            abort(403, match ($business->estado->value) {
                'pendiente' => 'Tu solicitud de alta todavía está en revisión.',
                'suspendido' => 'Tu cuenta está suspendida. Comunicate con la panadería.',
                default => 'Tu solicitud de alta fue rechazada.',
            });
        }

        return $next($request);
    }
}
