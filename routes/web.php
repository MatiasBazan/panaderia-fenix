<?php

use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\QuoteController;
use App\Http\Controllers\Admin\QuoteRequestController as AdminQuoteRequestController;
use App\Http\Controllers\Auth\ForcedPasswordController;
use App\Http\Controllers\Public\CatalogController;
use App\Http\Controllers\Public\LandingController;
use App\Http\Controllers\Public\QuoteRequestController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Público
|--------------------------------------------------------------------------
| Ninguna de estas rutas expone precios: el catálogo sale por
| PublicProductResource. Fortify registra /login, /logout y el reseteo.
*/

Route::get('/', LandingController::class)->name('home');

Route::get('productos', [CatalogController::class, 'index'])->name('productos.index');
Route::get('productos/{product}', [CatalogController::class, 'show'])->name('productos.show');

Route::get('cotizacion', [QuoteRequestController::class, 'create'])->name('cotizacion.create');
Route::post('cotizacion', [QuoteRequestController::class, 'store'])
    ->middleware('throttle:5,1')
    ->name('cotizacion.store');
Route::get('cotizacion/gracias', [QuoteRequestController::class, 'gracias'])->name('cotizacion.gracias');

// Ayuda de revisión de la fase 2, no forma parte del sistema. Sólo en local.
if (app()->environment('local')) {
    Route::inertia('_componentes', 'dev/componentes')->name('dev.componentes');
}

/*
|--------------------------------------------------------------------------
| Cambio obligatorio de clave
|--------------------------------------------------------------------------
| Fuera de los grupos de rol: un usuario con clave temporal tiene que pasar
| por acá antes de poder entrar a su panel.
*/

Route::middleware('auth')->group(function () {
    Route::get('cambiar-clave', [ForcedPasswordController::class, 'edit'])->name('password.forzado.edit');
    Route::put('cambiar-clave', [ForcedPasswordController::class, 'update'])->name('password.forzado.update');
});

/*
|--------------------------------------------------------------------------
| Administración
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'role:admin', 'password.changed'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/', DashboardController::class)->name('dashboard');

        Route::resource('categorias', CategoryController::class)
            ->parameters(['categorias' => 'category'])
            ->except(['show', 'create', 'edit']);

        Route::resource('productos', ProductController::class)
            ->parameters(['productos' => 'product'])
            ->except(['show']);

        // La bandeja lista solicitudes; el detalle muestra la solicitud junto a
        // su cotización, si ya se generó.
        Route::get('cotizaciones', [AdminQuoteRequestController::class, 'index'])
            ->name('cotizaciones.index');
        Route::get('cotizaciones/{quoteRequest}', [AdminQuoteRequestController::class, 'show'])
            ->name('cotizaciones.show');
        Route::patch('cotizaciones/{quoteRequest}/estado', [AdminQuoteRequestController::class, 'updateEstado'])
            ->name('cotizaciones.estado');
        Route::post('cotizaciones/{quoteRequest}/generar', [QuoteController::class, 'store'])
            ->name('cotizaciones.generar');

        // Mismo prefijo, pero acá el parámetro ya es la cotización, no la solicitud.
        Route::put('cotizaciones/{quote}', [QuoteController::class, 'update'])
            ->name('cotizaciones.update');
        Route::post('cotizaciones/{quote}/enviar', [QuoteController::class, 'send'])
            ->name('cotizaciones.enviar');
        Route::get('cotizaciones/{quote}/pdf', [QuoteController::class, 'pdf'])
            ->name('cotizaciones.pdf');
    });
