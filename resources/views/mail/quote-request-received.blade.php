<x-mail::message>
# Nueva solicitud de cotización

**{{ $solicitud->nombre }}** pidió una cotización con {{ $solicitud->items->count() }}
{{ \Illuminate\Support\Str::plural('producto', $solicitud->items->count()) }}.

<x-mail::panel>
**Contacto**
{{ $solicitud->telefono }}
@if ($solicitud->localidad)
{{ $solicitud->localidad }}
@endif
@if ($solicitud->fecha_evento)

**Fecha del evento:** {{ $solicitud->fecha_evento->format('d/m/Y') }}
@endif
</x-mail::panel>

<x-mail::table>
| Producto | Cantidad |
| :------- | -------: |
@foreach ($solicitud->items as $item)
| {{ $item->product?->nombre ?? 'Producto dado de baja' }}@if ($item->variante) — {{ $item->variante }}@endif@if ($item->nota)<br><small>{{ $item->nota }}</small>@endif | {{ rtrim(rtrim(number_format((float) $item->cantidad, 2, ',', '.'), '0'), ',') }} {{ $item->product?->unidad->badge() }} |
@endforeach
</x-mail::table>

@if ($solicitud->mensaje)
**Mensaje del cliente**

{{ $solicitud->mensaje }}
@endif

<x-mail::button :url="$url">
Ver la solicitud
</x-mail::button>

Recibida el {{ $solicitud->created_at->timezone(config('app.timezone'))->format('d/m/Y \a \l\a\s H:i') }}
desde {{ $solicitud->ip ?? 'origen desconocido' }}.
</x-mail::message>
