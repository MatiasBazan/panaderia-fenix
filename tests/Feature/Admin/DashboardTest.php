<?php

use App\Models\QuoteRequest;
use App\Models\User;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
});

it('cuenta las solicitudes pendientes en el tablero', function () {
    QuoteRequest::factory()->count(3)->create();

    $this->actingAs($this->admin)
        ->get('/admin')
        ->assertOk()
        ->assertInertia(
            fn ($page) => $page
                ->component('admin/dashboard')
                ->where('metricas.solicitudes_pendientes', 3),
        );
});

it('arma la serie de catorce días con los huecos en cero', function () {
    QuoteRequest::factory()->count(2)->create(['created_at' => now()]);
    QuoteRequest::factory()->create(['created_at' => now()->subDays(3)]);
    // Fuera de la ventana: no tiene que aparecer en ningún día de la serie.
    QuoteRequest::factory()->create(['created_at' => now()->subDays(30)]);

    $this->actingAs($this->admin)
        ->get('/admin')
        ->assertInertia(function ($page) {
            $serie = $page->toArray()['props']['serie_solicitudes'];

            expect($serie)->toHaveCount(14);
            expect($serie[13])->toMatchArray([
                'dia' => now()->toDateString(),
                'total' => 2,
            ]);
            expect($serie[10])->toMatchArray([
                'dia' => now()->subDays(3)->toDateString(),
                'total' => 1,
            ]);
            expect(array_sum(array_column($serie, 'total')))->toBe(3);

            return $page;
        });
});

it('le exige sesión de admin al tablero', function () {
    $this->get('/admin')->assertRedirect('/login');
});
