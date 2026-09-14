<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ProductUnidad;
use App\Enums\QuoteEstado;
use App\Enums\QuoteRequestEstado;
use App\Enums\TipoPedido;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\Quote;
use App\Models\QuoteRequest;
use App\Models\QuoteRequestItem;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Tablero de entrada de la administración: qué está esperando una respuesta.
 */
class DashboardController extends Controller
{
    /** Una solicitud pendiente que pasó este tiempo sin respuesta se marca como demorada. */
    private const HORAS_DEMORA = 48;

    public function __invoke(): Response
    {
        Gate::authorize('viewAny', QuoteRequest::class);

        $ahora = now();
        $hoy = $ahora->copy()->startOfDay();

        // Las tres métricas de cotizaciones salen de un solo barrido de la tabla
        // con agregados condicionales, en vez de tres COUNT sueltos. `toBase`:
        // lo que vuelve son contadores, no cotizaciones, y hidratar un modelo
        // con columnas que no son suyas es mentirle al que lo lea después.
        $cotizaciones = Quote::query()
            ->selectRaw('count(case when estado = ? then 1 end) as borrador', [QuoteEstado::Borrador->value])
            ->selectRaw('count(case when estado = ? then 1 end) as enviadas', [QuoteEstado::Enviada->value])
            ->selectRaw(
                'count(case when estado = ? and vence_el between ? and ? then 1 end) as por_vencer',
                [QuoteEstado::Enviada->value, $hoy->toDateString(), $hoy->copy()->addDays(7)->toDateString()],
            )
            ->toBase()
            ->first();

        $pendientes = QuoteRequest::query()
            ->pendientes()
            ->selectRaw('count(*) as total')
            ->selectRaw(
                'count(case when created_at < ? then 1 end) as demoradas',
                [$ahora->copy()->subHours(self::HORAS_DEMORA)->toDateTimeString()],
            )
            ->toBase()
            ->first();

        $productos = Product::query()
            ->activos()
            ->selectRaw('count(*) as activos')
            ->selectRaw('count(case when imagen is null then 1 end) as sin_foto')
            ->toBase()
            ->first();

        // Actividad de las últimas dos semanas. Se agrupa en la base y después se
        // rellenan los días sin solicitudes: un hueco en el eje se lee como
        // «no hubo datos», y lo que hubo fue cero.
        $desde = $hoy->copy()->subDays(13);

        $porDia = QuoteRequest::query()
            ->where('created_at', '>=', $desde)
            ->selectRaw('date(created_at) as dia, count(*) as total')
            ->groupBy('dia')
            ->toBase()
            ->pluck('total', 'dia');

        $serie = collect(range(0, 13))
            ->map(function (int $offset) use ($desde, $porDia): array {
                $dia = $desde->copy()->addDays($offset)->toDateString();

                return ['dia' => $dia, 'total' => (int) $porDia->get($dia, 0)];
            })
            ->all();

        return Inertia::render('admin/dashboard', [
            'metricas' => [
                'solicitudes_pendientes' => (int) $pendientes->total,
                'solicitudes_demoradas' => (int) $pendientes->demoradas,
                'cotizaciones_borrador' => (int) $cotizaciones->borrador,
                'cotizaciones_enviadas' => (int) $cotizaciones->enviadas,
                'cotizaciones_por_vencer' => (int) $cotizaciones->por_vencer,
                'productos_activos' => (int) $productos->activos,
                'productos_sin_foto' => (int) $productos->sin_foto,
                'categorias_activas' => Category::query()->activas()->count(),
            ],
            'mes' => $this->mes(),
            'serie_solicitudes' => $serie,
            'proximos_eventos' => $this->proximosEventos(),
            'mas_pedidos' => $this->masPedidos(),
            'ultimas_solicitudes' => QuoteRequest::query()
                ->withCount('items')
                ->with('quote:id,quote_request_id,numero,estado')
                ->latest()
                ->limit(8)
                ->get()
                ->map(fn (QuoteRequest $solicitud): array => [
                    'id' => $solicitud->id,
                    'nombre' => $solicitud->nombre,
                    'telefono' => $solicitud->telefono,
                    'items_count' => $solicitud->items_count,
                    'estado' => $solicitud->estado->value,
                    'estado_label' => $solicitud->estado->label(),
                    'creada_el' => $solicitud->created_at?->toIso8601String(),
                    'cotizacion_numero' => $solicitud->quote?->numero,
                ]),
        ]);
    }

    /**
     * Lo que va del mes contra el mismo tramo del mes pasado: comparar contra el
     * mes anterior entero haría ver cualquier día 5 como una caída.
     *
     * @return array<string, mixed>
     */
    private function mes(): array
    {
        $ahora = now();
        $inicio = $ahora->copy()->startOfMonth();
        $inicioAnterior = $inicio->copy()->subMonthNoOverflow();
        $corteAnterior = $ahora->copy()->subMonthNoOverflow();

        $solicitudes = QuoteRequest::query()
            ->where('created_at', '>=', $inicioAnterior)
            ->selectRaw('count(case when created_at >= ? then 1 end) as este_mes', [$inicio->toDateTimeString()])
            ->selectRaw(
                'count(case when created_at < ? and created_at <= ? then 1 end) as mes_anterior',
                [$inicio->toDateTimeString(), $corteAnterior->toDateTimeString()],
            )
            ->selectRaw(
                'count(case when created_at >= ? and tipo = ? then 1 end) as mayoristas',
                [$inicio->toDateTimeString(), TipoPedido::Mayorista->value],
            )
            ->toBase()
            ->first();

        // Se cuenta por fecha de envío: la cotización de una solicitud del mes
        // pasado que salió hoy es trabajo de este mes. El tiempo de respuesta va
        // desde que entró la solicitud hasta que salió la cotización.
        $enviadas = Quote::query()
            ->join('quote_requests', 'quote_requests.id', '=', 'quotes.quote_request_id')
            ->where('quotes.enviada_el', '>=', $inicio)
            ->selectRaw('count(*) as cantidad')
            ->selectRaw('coalesce(sum(quotes.total), 0) as monto')
            ->selectRaw('avg(timestampdiff(minute, quote_requests.created_at, quotes.enviada_el)) as respuesta_minutos')
            ->toBase()
            ->first();

        $cantidad = (int) $enviadas->cantidad;
        $monto = (float) $enviadas->monto;

        return [
            'solicitudes' => (int) $solicitudes->este_mes,
            'solicitudes_mes_anterior' => (int) $solicitudes->mes_anterior,
            'mayoristas' => (int) $solicitudes->mayoristas,
            'cotizaciones_enviadas' => $cantidad,
            'monto_enviado' => number_format($monto, 2, '.', ''),
            'ticket_promedio' => $cantidad === 0 ? null : number_format($monto / $cantidad, 2, '.', ''),
            'respuesta_minutos' => $enviadas->respuesta_minutos === null
                ? null
                : (int) round((float) $enviadas->respuesta_minutos),
        ];
    }

    /**
     * Solicitudes con fecha de evento en las próximas dos semanas: lo que hay
     * que tener en cuenta para producir. Las rechazadas y vencidas no cuentan.
     *
     * @return array<int, array<string, mixed>>
     */
    private function proximosEventos(): array
    {
        $hoy = now()->startOfDay();

        return QuoteRequest::query()
            ->whereBetween('fecha_evento', [$hoy->toDateString(), $hoy->copy()->addDays(14)->toDateString()])
            ->whereNotIn('estado', [QuoteRequestEstado::Rechazada, QuoteRequestEstado::Vencida])
            ->with('quote:id,quote_request_id,numero,total')
            ->orderBy('fecha_evento')
            ->limit(6)
            ->get()
            ->map(fn (QuoteRequest $solicitud): array => [
                'id' => $solicitud->id,
                'nombre' => $solicitud->nombre,
                'tipo_label' => $solicitud->tipo->label(),
                'fecha_evento' => $solicitud->fecha_evento?->toDateString(),
                'dias' => (int) $hoy->diffInDays($solicitud->fecha_evento),
                'estado' => $solicitud->estado->value,
                'estado_label' => $solicitud->estado->label(),
                'total' => $solicitud->quote === null ? null : (string) $solicitud->quote->total,
            ])
            ->values()
            ->all();
    }

    /**
     * Los productos que más se piden, contados por solicitud y no por cantidad:
     * 50 kg de un solo pedido mayorista no dicen que un producto sea popular.
     * El join va a la tabla cruda, así que un producto dado de baja igual aparece.
     *
     * @return array<int, array<string, mixed>>
     */
    private function masPedidos(): array
    {
        return QuoteRequestItem::query()
            ->join('quote_requests', 'quote_requests.id', '=', 'quote_request_items.quote_request_id')
            ->join('products', 'products.id', '=', 'quote_request_items.product_id')
            ->where('quote_requests.created_at', '>=', now()->subDays(30))
            ->groupBy('products.id', 'products.nombre', 'products.unidad', 'products.deleted_at')
            ->select('products.id', 'products.nombre', 'products.unidad', 'products.deleted_at')
            ->selectRaw('count(distinct quote_request_items.quote_request_id) as solicitudes')
            ->selectRaw('sum(quote_request_items.cantidad) as cantidad')
            ->orderByDesc('solicitudes')
            ->orderByDesc('cantidad')
            ->limit(5)
            ->toBase()
            ->get()
            ->map(fn (object $fila): array => [
                'id' => (int) $fila->id,
                'nombre' => (string) $fila->nombre,
                'unidad_label' => ProductUnidad::from((string) $fila->unidad)->label(),
                'solicitudes' => (int) $fila->solicitudes,
                'cantidad' => (string) $fila->cantidad,
                'dado_de_baja' => $fila->deleted_at !== null,
            ])
            ->values()
            ->all();
    }
}
