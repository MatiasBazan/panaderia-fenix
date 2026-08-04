<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForcedPasswordUpdateRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Cambio obligatorio de la clave temporal con la que se da de alta un comercio.
 */
class ForcedPasswordController extends Controller
{
    public function edit(Request $request): Response|RedirectResponse
    {
        if (! $request->user()?->must_change_password) {
            return redirect($request->user()->role->homeRoute());
        }

        return Inertia::render('auth/forced-password', [
            'passwordRules' => Password::default()->toPasswordRulesString(),
        ]);
    }

    public function update(ForcedPasswordUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();

        $user->forceFill([
            'password' => $request->validated('password'),
            'must_change_password' => false,
        ])->save();

        return redirect($user->role->homeRoute())
            ->with('exito', 'Listo, tu clave quedó actualizada.');
    }
}
