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

it('no deja al admin entrar al portal de comercios', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->get('/portal')->assertForbidden();
});

it('deja entrar al portal a un comercio activo', function () {
    $user = User::factory()->comercio(Business::factory()->create())->create();

    $this->actingAs($user)->get('/portal')->assertOk();
});

it('bloquea el portal a un comercio suspendido', function () {
    $business = Business::factory()->suspendido()->create();
    $user = User::factory()->comercio($business)->create();

    $this->actingAs($user)->get('/portal')->assertForbidden();
});

it('bloquea el portal a un comercio pendiente de aprobación', function () {
    $business = Business::factory()->pendiente()->create();
    $user = User::factory()->comercio($business)->create();

    $this->actingAs($user)->get('/portal')->assertForbidden();
});

it('manda a cambiar la clave temporal antes de dejar navegar el portal', function () {
    $business = Business::factory()->create();
    $user = User::factory()->comercio($business)->debeCambiarPassword()->create();

    $this->actingAs($user)->get('/portal')->assertRedirect('/cambiar-clave');
});

it('libera el portal después de cambiar la clave temporal', function () {
    $business = Business::factory()->create();
    $user = User::factory()->comercio($business)->debeCambiarPassword()->create();

    $this->actingAs($user)->put('/cambiar-clave', [
        'current_password' => 'password',
        'password' => 'clave-nueva-larga-2026',
        'password_confirmation' => 'clave-nueva-larga-2026',
    ])->assertRedirect('/portal');

    expect($user->fresh()->must_change_password)->toBeFalse();

    $this->actingAs($user->fresh())->get('/portal')->assertOk();
});

it('exige sesión iniciada en portal y admin', function () {
    $this->get('/portal')->assertRedirect('/login');
    $this->get('/admin')->assertRedirect('/login');
});
