<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Restringe un grupo de rutas a uno o más roles.
 * Uso: `->middleware('role:admin')` o `->middleware('role:admin,comercio')`.
 */
class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if ($user === null) {
            abort(403);
        }

        $permitidos = array_map(
            fn (string $role): UserRole => UserRole::from($role),
            $roles,
        );

        if (! in_array($user->role, $permitidos, true)) {
            abort(403, 'No tenés acceso a esta sección.');
        }

        return $next($request);
    }
}
