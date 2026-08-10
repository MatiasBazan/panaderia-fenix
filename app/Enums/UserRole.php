<?php

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'admin';
    case Comercio = 'comercio';

    public function label(): string
    {
        return match ($this) {
            self::Admin => 'Administración',
            self::Comercio => 'Comercio',
        };
    }

    /** Ruta a la que se envía al usuario después de iniciar sesión. */
    public function homeRoute(): string
    {
        return match ($this) {
            self::Admin => '/admin',
            // El portal de comercios se retiró: sólo queda la landing pública y el admin.
            self::Comercio => '/',
        };
    }
}
