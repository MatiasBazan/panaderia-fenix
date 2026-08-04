<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * @var string
     */
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Props compartidas en toda respuesta.
     *
     * Acá nunca va nada con precios: el catálogo público se arma con
     * `PublicProductResource`, que no los expone.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $niveles = ['exito', 'alerta', 'error', 'info'];

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user === null ? null : [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role->value,
                    'business_id' => $user->business_id,
                    'must_change_password' => $user->must_change_password,
                    'last_login_at' => $user->last_login_at?->toIso8601String(),
                ],
            ],
            'flash' => fn (): array => [
                'tipo' => collect($niveles)->first(fn (string $tipo): bool => $request->session()->has($tipo)),
                'mensaje' => collect($niveles)
                    ->map(fn (string $tipo): mixed => $request->session()->get($tipo))
                    ->first(fn (mixed $mensaje): bool => $mensaje !== null),
            ],
        ];
    }
}
