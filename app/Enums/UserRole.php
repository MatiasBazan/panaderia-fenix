<?php

namespace App\Enums;

/**
 * Roles con acceso privado al sistema. Por ahora sólo la administración:
 * el sistema es de gestión interna y los comercios no tienen cuenta.
 */
enum UserRole: string
{
    case Admin = 'admin';

    public function label(): string
    {
        return match ($this) {
            self::Admin => 'Administración',
        };
    }

    /** Ruta a la que se envía al usuario después de iniciar sesión. */
    public function homeRoute(): string
    {
        return match ($this) {
            self::Admin => '/admin',
        };
    }
}
