<?php

namespace App\Http\Controllers\Admin;

use App\Enums\QuoteEstado;
use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\Category;
use App\Models\Product;
use App\Models\Quote;
use App\Models\QuoteRequest;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Tablero de entrada de la administración: qué está esperando una respuesta.
 */
class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        Gate::authorize('viewAny', QuoteRequest::class);

        return Inertia::render('admin/dashboard', [
            'metricas' => [
                'solicitudes_pendientes' => QuoteRequest::query()->pendientes()->count(),
                'cotizaciones_borrador' => Quote::query()->where('estado', QuoteEstado::Borrador)->count(),
                'cotizaciones_enviadas' => Quote::query()->enviadas()->count(),
                'cotizaciones_por_vencer' => Quote::query()
                    ->enviadas()
                    ->whereBetween('vence_el', [now()->toDateString(), now()->addDays(7)->toDateString()])
                    ->count(),
                'productos_activos' => Product::query()->activos()->count(),
                'categorias_activas' => Category::query()->activas()->count(),
                'comercios_activos' => Business::query()->activos()->count(),
                'comercios_pendientes' => Business::query()->pendientes()->count(),
            ],
            'ultimas_solicitudes' => QuoteRequest::query()
                ->withCount('items')
                ->with('quote:id,quote_request_id,numero,estado')
                ->latest()
                ->limit(8)
                ->get()
                ->map(fn (QuoteRequest $solicitud): array => [
                    'id' => $solicitud->id,
                    'nombre' => $solicitud->nombre,
                    'localidad' => $solicitud->localidad,
                    'items_count' => $solicitud->items_count,
                    'estado' => $solicitud->estado->value,
                    'estado_label' => $solicitud->estado->label(),
                    'creada_el' => $solicitud->created_at?->toIso8601String(),
                    'cotizacion_numero' => $solicitud->quote?->numero,
                ]),
        ]);
    }
}
