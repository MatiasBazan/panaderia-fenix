<?php

namespace App\Console\Commands;

use App\Concerns\PasswordValidationRules;
use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/**
 * Cambia el email y la clave de la cuenta de administración (o la crea si no
 * hay ninguna). La clave se pide oculta y dos veces, nunca por argumento: así
 * no queda en el historial de la shell del servidor.
 */
class CredencialesAdmin extends Command
{
    use PasswordValidationRules;

    protected $signature = 'fenix:admin';

    protected $description = 'Cambia el email y la clave de la cuenta de administración';

    public function handle(): int
    {
        $admins = User::query()->where('role', UserRole::Admin)->orderBy('id')->get();

        $admin = $admins->count() > 1
            ? $admins->firstWhere('email', $this->choice(
                'Hay más de una cuenta de administración. ¿Cuál cambiás?',
                $admins->pluck('email')->all(),
            ))
            : $admins->first();

        $datos = [
            'email' => Str::lower(trim((string) $this->ask('Email para entrar', $admin?->email))),
            'password' => $this->secret('Clave nueva'),
            'password_confirmation' => $this->secret('Repetí la clave'),
        ];

        $validator = Validator::make($datos, [
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($admin?->id)],
            'password' => $this->passwordRules(),
        ]);

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $error) {
                $this->error($error);
            }

            return self::FAILURE;
        }

        $admin ??= new User;

        $admin->forceFill([
            'name' => $admin->name ?? 'Administración Fénix',
            'email' => $datos['email'],
            'password' => $datos['password'],
            'role' => UserRole::Admin,
            'business_id' => null,
            'must_change_password' => false,
            'email_verified_at' => $admin->email_verified_at ?? now(),
            // Invalida los "recordarme" emitidos con la clave vieja.
            'remember_token' => Str::random(60),
        ])->save();

        // Y las sesiones abiertas: quien tenía la clave vieja queda afuera.
        if (config('session.driver') === 'database') {
            DB::table(config('session.table', 'sessions'))->where('user_id', $admin->id)->delete();
        }

        $this->info("Listo: la administración entra con {$admin->email}.");

        if (config('fenix.admin_email') !== $admin->email) {
            $this->warn(sprintf(
                'Los avisos de cotizaciones siguen llegando a %s. Si tienen que ir al email nuevo, cambiá FENIX_ADMIN_EMAIL en el .env.',
                config('fenix.admin_email'),
            ));
        }

        return self::SUCCESS;
    }
}
