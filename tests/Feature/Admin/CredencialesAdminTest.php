<?php

use App\Enums\UserRole;
use App\Models\User;
use Database\Seeders\UserSeeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

it('cambia el email y la clave del admin', function () {
    $admin = User::factory()->admin()->create(['email' => 'viejo@fenix.test']);

    $this->artisan('fenix:admin')
        ->expectsQuestion('Email para entrar', ' Nuevo@Fenix.test ')
        ->expectsQuestion('Clave nueva', 'clave-nueva-larga-2026')
        ->expectsQuestion('Repetí la clave', 'clave-nueva-larga-2026')
        ->assertSuccessful();

    $admin->refresh();

    expect($admin->email)->toBe('nuevo@fenix.test')
        ->and(Hash::check('clave-nueva-larga-2026', $admin->password))->toBeTrue()
        ->and($admin->must_change_password)->toBeFalse();
});

it('no cambia nada si las claves no coinciden', function () {
    $admin = User::factory()->admin()->create(['email' => 'viejo@fenix.test']);
    $hashAnterior = $admin->password;

    $this->artisan('fenix:admin')
        ->expectsQuestion('Email para entrar', 'nuevo@fenix.test')
        ->expectsQuestion('Clave nueva', 'clave-nueva-larga-2026')
        ->expectsQuestion('Repetí la clave', 'otra-clave-distinta-2026')
        ->assertFailed();

    $admin->refresh();

    expect($admin->email)->toBe('viejo@fenix.test')
        ->and($admin->password)->toBe($hashAnterior);
});

it('cierra las sesiones abiertas con la clave vieja', function () {
    config(['session.driver' => 'database']);
    $admin = User::factory()->admin()->create();

    DB::table('sessions')->insert([
        'id' => 'sesion-vieja',
        'user_id' => $admin->id,
        'ip_address' => '127.0.0.1',
        'user_agent' => 'test',
        'payload' => '',
        'last_activity' => now()->timestamp,
    ]);

    $this->artisan('fenix:admin')
        ->expectsQuestion('Email para entrar', $admin->email)
        ->expectsQuestion('Clave nueva', 'clave-nueva-larga-2026')
        ->expectsQuestion('Repetí la clave', 'clave-nueva-larga-2026')
        ->assertSuccessful();

    expect(DB::table('sessions')->where('user_id', $admin->id)->count())->toBe(0);
});

it('crea el admin si todavía no hay ninguno', function () {
    $this->artisan('fenix:admin')
        ->expectsQuestion('Email para entrar', 'admin@fenix.test')
        ->expectsQuestion('Clave nueva', 'clave-nueva-larga-2026')
        ->expectsQuestion('Repetí la clave', 'clave-nueva-larga-2026')
        ->assertSuccessful();

    $admin = User::query()->where('email', 'admin@fenix.test')->sole();

    expect($admin->role)->toBe(UserRole::Admin)
        ->and(Hash::check('clave-nueva-larga-2026', $admin->password))->toBeTrue();
});

it('re-seedear no le pisa la clave al admin ni crea otro', function () {
    $admin = User::factory()->admin()->create([
        'email' => 'cliente@fenix.test',
        'password' => 'clave-del-cliente-2026',
    ]);

    $this->seed(UserSeeder::class);

    expect(Hash::check('clave-del-cliente-2026', $admin->fresh()->password))->toBeTrue()
        ->and(User::query()->where('role', UserRole::Admin)->count())->toBe(1);
});
