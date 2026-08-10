<?php

namespace Database\Seeders;

use App\Enums\BusinessEstado;
use App\Enums\CondicionIva;
use App\Enums\UserRole;
use App\Models\Business;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Cuentas de arranque: la administración de la panadería y comercios de
     * ejemplo en los tres estados de la cuenta corriente en el admin.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => config('fenix.admin_email')],
            [
                'name' => 'Administración Fénix',
                'password' => Hash::make('password'),
                'role' => UserRole::Admin,
                'business_id' => null,
                'must_change_password' => false,
                'email_verified_at' => now(),
            ],
        );

        $activo = Business::updateOrCreate(
            ['cuit' => '30-71234567-4'],
            [
                'razon_social' => 'Almacén Don Pedro S.R.L.',
                'nombre_fantasia' => 'Don Pedro',
                'condicion_iva' => CondicionIva::ResponsableInscripto,
                'direccion' => 'Bv. San Juan 820',
                'localidad' => 'Córdoba',
                'telefono' => '351-455-1200',
                'email_contacto' => 'compras@donpedro.com.ar',
                'descuento_porcentaje' => '12.00',
                'limite_credito' => '400000.00',
                'estado' => BusinessEstado::Activo,
            ],
        );

        User::updateOrCreate(
            ['email' => 'compras@donpedro.com.ar'],
            [
                'name' => 'Pedro Gutiérrez',
                'password' => Hash::make('password'),
                'role' => UserRole::Comercio,
                'business_id' => $activo->id,
                'must_change_password' => false,
                'email_verified_at' => now(),
            ],
        );

        $suspendido = Business::updateOrCreate(
            ['cuit' => '30-70987654-1'],
            [
                'razon_social' => 'Kiosco La Esquina',
                'nombre_fantasia' => 'La Esquina',
                'condicion_iva' => CondicionIva::Monotributo,
                'direccion' => 'Rivadavia 45',
                'localidad' => 'Villa Allende',
                'telefono' => '3543-42-1188',
                'email_contacto' => 'laesquina@gmail.com',
                'descuento_porcentaje' => '5.00',
                'limite_credito' => null,
                'estado' => BusinessEstado::Suspendido,
                'notas_internas' => 'Suspendido por mora mayor a 60 días.',
            ],
        );

        // Comercio recién dado de alta: entra con clave temporal y debe cambiarla.
        User::updateOrCreate(
            ['email' => 'laesquina@gmail.com'],
            [
                'name' => 'Marta Ríos',
                'password' => Hash::make('password'),
                'role' => UserRole::Comercio,
                'business_id' => $suspendido->id,
                'must_change_password' => true,
                'email_verified_at' => now(),
            ],
        );

        // Solicitud de alta esperando revisión del admin: todavía sin usuario.
        Business::updateOrCreate(
            ['cuit' => '27-33445566-8'],
            [
                'razon_social' => 'Confitería Belgrano',
                'nombre_fantasia' => null,
                'condicion_iva' => CondicionIva::Monotributo,
                'direccion' => 'Belgrano 1120',
                'localidad' => 'Alta Gracia',
                'telefono' => '3547-42-6600',
                'email_contacto' => 'confiteriabelgrano@gmail.com',
                'descuento_porcentaje' => '0.00',
                'limite_credito' => null,
                'estado' => BusinessEstado::Pendiente,
            ],
        );
    }
}
