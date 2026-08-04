<?php

use App\Models\Business;
use App\Models\User;
use Illuminate\Support\Facades\RateLimiter;

it('muestra el formulario de login', function () {
    $this->get('/login')->assertOk();
});

it('manda al admin a /admin después de ingresar', function () {
    $admin = User::factory()->admin()->create();

    $this->post('/login', ['email' => $admin->email, 'password' => 'password'])
        ->assertRedirect('/admin');

    $this->assertAuthenticatedAs($admin);
});

it('manda al comercio a /portal después de ingresar', function () {
    $business = Business::factory()->create();
    $user = User::factory()->comercio($business)->create();

    $this->post('/login', ['email' => $user->email, 'password' => 'password'])
        ->assertRedirect('/portal');

    $this->assertAuthenticatedAs($user);
});

it('manda a cambiar la clave temporal antes que al portal', function () {
    $business = Business::factory()->create();
    $user = User::factory()->comercio($business)->debeCambiarPassword()->create();

    $this->post('/login', ['email' => $user->email, 'password' => 'password'])
        ->assertRedirect('/cambiar-clave');
});

it('registra el último ingreso', function () {
    $user = User::factory()->admin()->create(['last_login_at' => null]);

    $this->post('/login', ['email' => $user->email, 'password' => 'password']);

    expect($user->fresh()->last_login_at)->not->toBeNull();
});

it('rechaza una clave incorrecta', function () {
    $user = User::factory()->admin()->create();

    $this->post('/login', ['email' => $user->email, 'password' => 'clave-mala']);

    $this->assertGuest();
});

it('limita los intentos de ingreso', function () {
    $user = User::factory()->admin()->create();

    RateLimiter::increment(md5('login'.implode('|', [$user->email, '127.0.0.1'])), amount: 5);

    $this->post('/login', ['email' => $user->email, 'password' => 'clave-mala'])
        ->assertTooManyRequests();
});

it('cierra la sesión', function () {
    $user = User::factory()->admin()->create();

    $this->actingAs($user)->post('/logout')->assertRedirect('/');

    $this->assertGuest();
});

it('no expone una ruta de registro', function () {
    $this->get('/register')->assertNotFound();
});
