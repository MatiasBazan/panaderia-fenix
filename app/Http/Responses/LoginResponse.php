<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

/**
 * Después del login sólo hay un destino posible: el panel de administración,
 * que es la única cara privada del sistema.
 */
class LoginResponse implements LoginResponseContract
{
    public function toResponse($request): RedirectResponse|JsonResponse
    {
        /** @var Request $request */
        $user = $request->user();

        if ($user?->must_change_password) {
            return redirect()->route('password.forzado.edit');
        }

        $destino = $user?->role->homeRoute() ?? '/';

        // Una pantalla pública guardada como `intended` (la landing, el catálogo)
        // dejaría al admin fuera de su panel: en ese caso se descarta.
        $intended = session()->get('url.intended');

        if ($intended !== null && ! str_starts_with($intended, url('/admin'))) {
            session()->forget('url.intended');
        }

        return $request->wantsJson()
            ? new JsonResponse(['two_factor' => false, 'redirect' => $destino])
            : redirect()->intended($destino);
    }
}
