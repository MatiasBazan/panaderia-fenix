<?php

use App\Models\Business;
use App\Models\User;

it('deja al admin entrar al panel de administración', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->get('/admin')->assertOk();
});

it('no deja a un comercio entrar al panel de administración', function () {
    $user = User::factory()->comercio(Business::factory()->create())->create();

    $this->actingAs($user)->get('/admin')->assertForbidden();
});

it('manda a cambiar la clave temporal antes de dejar entrar al admin', function () {
    $admin = User::factory()->admin()->debeCambiarPassword()->create();

    $this->actingAs($admin)->get('/admin')->assertRedirect('/cambiar-clave');
});

it('libera el acceso después de cambiar la clave temporal', function () {
    $admin = User::factory()->admin()->debeCambiarPassword()->create();

    $this->actingAs($admin)->put('/cambiar-clave', [
        'current_password' => 'password',
        'password' => 'clave-nueva-larga-2026',
        'password_confirmation' => 'clave-nueva-larga-2026',
    ])->assertRedirect('/admin');

    expect($admin->fresh()->must_change_password)->toBeFalse();

    $this->actingAs($admin->fresh())->get('/admin')->assertOk();
});

it('exige sesión iniciada en el admin', function () {
    $this->get('/admin')->assertRedirect('/login');
});
