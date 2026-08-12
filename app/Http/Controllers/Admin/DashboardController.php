<?php

namespace App\Http\Controllers\Admin;

use App\Enums\BusinessEstado;
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

        // Las tres métricas de cotizaciones salen de un solo barrido de la tabla
        // con agregados condicionales, en vez de tres COUNT sueltos. `toBase`:
        // lo que vuelve son contadores, no cotizaciones, y hidratar un modelo
        // con columnas que no son suyas es mentirle al que lo lea después.
        $cotizaciones = Quote::query()
            ->selectRaw('count(case when estado = ? then 1 end) as borrador', [QuoteEstado::Borrador->value])
            ->selectRaw('count(case when estado = ? then 1 end) as enviadas', [QuoteEstado::Enviada->value])
            ->selectRaw(
                'count(case when estado = ? and vence_el between ? and ? then 1 end) as por_vencer',
                [QuoteEstado::Enviada->value, now()->toDateString(), now()->addDays(7)->toDateString()],
            )
            ->toBase()
            ->first();

        // Ídem para los dos estados de comercio que interesan al tablero.
        $comercios = Business::query()
            ->selectRaw('count(case when estado = ? then 1 end) as activos', [BusinessEstado::Activo->value])
            ->selectRaw('count(case when estado = ? then 1 end) as pendientes', [BusinessEstado::Pendiente->value])
            ->toBase()
            ->first();

        return Inertia::render('admin/dashboard', [
            'metricas' => [
                'solicitudes_pendientes' => QuoteRequest::query()->pendientes()->count(),
                'cotizaciones_borrador' => (int) $cotizaciones->borrador,
                'cotizaciones_enviadas' => (int) $cotizaciones->enviadas,
                'cotizaciones_por_vencer' => (int) $cotizaciones->por_vencer,
                'productos_activos' => Product::query()->activos()->count(),
                'categorias_activas' => Category::query()->activas()->count(),
                'comercios_activos' => (int) $comercios->activos,
                'comercios_pendientes' => (int) $comercios->pendientes,
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
