@php
    use App\Support\Money;

    $cantidad = static fn ($valor): string => rtrim(rtrim(number_format((float) $valor, 2, ',', '.'), '0'), ',');
@endphp
{{-- Versión de texto plano: la leen los clientes que no muestran HTML. Sin
     escapar, porque acá no hay HTML que proteger. --}}
NUEVA SOLICITUD DE COTIZACIÓN

{!! $solicitud->nombre !!} pidió una cotización ({!! $solicitud->tipo->label() !!}).

Teléfono: {!! $solicitud->telefono !!}
@if ($solicitud->localidad)
Localidad: {!! $solicitud->localidad !!}
@endif
@if ($solicitud->fecha_evento)
Fecha del evento: {{ $solicitud->fecha_evento->format('d/m/Y') }}
@endif

Lo que pidió:
@foreach ($solicitud->items as $item)
- {{ $cantidad($item->cantidad) }} {{ $item->product?->unidad->badge() }} × {!! $item->product?->nombre ?? 'Producto dado de baja' !!}@if ($item->variante) ({!! $item->variante !!})@endif

@if ($item->nota)
  Nota: {!! $item->nota !!}
@endif
@endforeach
@if ($cotizacion && (float) $cotizacion->total > 0)

Borrador listo ({{ $cotizacion->numero }}): {{ Money::format($cotizacion->total) }}, vence el {{ $cotizacion->vence_el->format('d/m/Y') }}.
@endif
@if ($solicitud->mensaje)

Mensaje del cliente:
{!! $solicitud->mensaje !!}
@endif

Ver la solicitud: {{ $url }}
@if ($whatsapp)
Escribirle por WhatsApp: {{ $whatsapp }}
@endif

Recibida el {{ $solicitud->created_at->timezone(config('app.timezone'))->format('d/m/Y \a \l\a\s H:i') }}.

--
{{ config('app.name') }} · Leones, Córdoba
