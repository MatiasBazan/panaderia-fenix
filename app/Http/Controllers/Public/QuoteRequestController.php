<?php

namespace App\Http\Controllers\Public;

use App\Actions\QuoteRequests\CreateQuoteRequest;
use App\Actions\QuoteRequests\QuoteRequestData;
use App\Http\Controllers\Controller;
use App\Http\Requests\Public\StoreQuoteRequestRequest;
use App\Http\Resources\PublicProductResource;
use App\Models\Product;
use App\Models\QuoteRequest;
use App\Support\Settings;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Solicitud de cotización del público. La lista de productos vive en el
 * navegador del visitante; el servidor sólo la valida al enviarla.
 */
class QuoteRequestController extends Controller
{
    /**
     * Pantalla de revisión. Recibe los ids que el visitante lleva armados y
     * devuelve los productos vigentes, para poder avisar si alguno se dio de baja.
     */
    public function create(Request $request, Settings $settings): Response
    {
        $ids = collect(explode(',', $request->string('items')->toString()))
            ->map(fn (string $id): int => (int) trim($id))
            ->filter()
            ->unique()
            ->values();

        $productos = $ids->isEmpty()
            ? collect()
            : Product::query()->activos()->with('category')->whereIn('id', $ids)->ordenados()->get();

        return Inertia::render('public/cotizacion', [
            'productos' => PublicProductResource::collection($productos),
            'zonas' => $settings->zonasEntrega(),
        ]);
    }

    public function store(StoreQuoteRequestRequest $request, CreateQuoteRequest $action): RedirectResponse
    {
        $solicitud = $action->handle(QuoteRequestData::fromRequest($request));

        return redirect()
            ->route('cotizacion.gracias')
            ->with('solicitud_id', $solicitud->id);
    }

    public function gracias(Request $request, Settings $settings): Response
    {
        $id = $request->session()->get('solicitud_id');

        $solicitud = $id === null
            ? null
            : QuoteRequest::query()
                // withTrashed: si un producto se dio de baja después del pedido,
                // la solicitud igual tiene que poder leerse tal como entró.
                ->with(['items.product' => fn ($query) => $query->withTrashed()])
                ->whereKey($id)
                ->first();

        $contacto = $solicitud === null ? null : $this->contacto($solicitud);

        return Inertia::render('public/cotizacion-gracias', [
            'enviada' => $solicitud !== null,
            'panaderia' => $settings->datosPanaderia(),
            'contacto' => $contacto['nombre'] ?? null,
            'whatsappUrl' => $solicitud === null || $contacto === null
                ? null
                : $this->whatsappUrl($solicitud, $contacto),
        ]);
    }

    /**
     * Contacto de la panadería que atiende el tipo de pedido elegido: Nati para
     * los minoristas/casuales, Juan para los mayoristas. Null si no hay número.
     *
     * @return array{nombre: string, whatsapp: string}|null
     */
    private function contacto(QuoteRequest $solicitud): ?array
    {
        /** @var array{nombre?: string, whatsapp?: string} $contacto */
        $contacto = (array) config("fenix.contactos_pedidos.{$solicitud->tipo->value}");

        if (empty($contacto['whatsapp'])) {
            return null;
        }

        return [
            'nombre' => (string) ($contacto['nombre'] ?? ''),
            'whatsapp' => (string) $contacto['whatsapp'],
        ];
    }

    /**
     * Arma el enlace wa.me hacia el contacto que corresponde, con el detalle del
     * pedido ya cargado, para que el visitante lo mande con un toque.
     *
     * @param  array{nombre: string, whatsapp: string}  $contacto
     */
    private function whatsappUrl(QuoteRequest $solicitud, array $contacto): string
    {
        $numero = $contacto['whatsapp'];

        $saludo = $contacto['nombre'] === ''
            ? 'Hola! Te paso mi pedido:'
            : "Hola {$contacto['nombre']}! Te paso mi pedido:";

        $lineas = [$saludo, ''];

        foreach ($solicitud->items as $item) {
            $cantidad = rtrim(rtrim((string) $item->cantidad, '0'), '.');
            $nombre = $item->product?->nombre ?? 'Producto';
            $linea = "• {$cantidad} × {$nombre}";

            if ($item->nota !== null && $item->nota !== '') {
                $linea .= " ({$item->nota})";
            }

            $lineas[] = $linea;
        }

        $lineas[] = '';
        $lineas[] = "Nombre: {$solicitud->nombre}";

        if ($solicitud->localidad !== null && $solicitud->localidad !== '') {
            $lineas[] = "Localidad: {$solicitud->localidad}";
        }

        if ($solicitud->fecha_evento !== null) {
            $lineas[] = "Fecha: {$solicitud->fecha_evento->format('d/m/Y')}";
        }

        if ($solicitud->mensaje !== null && $solicitud->mensaje !== '') {
            $lineas[] = "Mensaje: {$solicitud->mensaje}";
        }

        return 'https://wa.me/'.$numero.'?text='.rawurlencode(implode("\n", $lineas));
    }
}
