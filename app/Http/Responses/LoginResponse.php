<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

/**
 * Un solo formulario de login para las dos caras privadas del sistema:
 * el destino lo decide el rol del usuario.
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

        return $request->wantsJson()
            ? new JsonResponse(['two_factor' => false, 'redirect' => $destino])
            : redirect()->intended($destino);
    }
}
