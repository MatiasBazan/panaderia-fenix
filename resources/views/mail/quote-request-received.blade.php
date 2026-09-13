@php
    use App\Enums\TipoPedido;
    use App\Support\Money;
    use Illuminate\Support\Str;

    $cantidad = static fn ($valor): string => rtrim(rtrim(number_format((float) $valor, 2, ',', '.'), '0'), ',');
    $productos = $solicitud->items->count();
@endphp
{{-- Cuerpo en HTML dentro del markdown: cada bloque va sin sangría y sin
     líneas en blanco adentro, o el parser lo toma como código. --}}
<x-mail::message>
<p class="eyebrow">Nueva solicitud de cotización</p>

# {{ $solicitud->nombre }} pidió una cotización

<p class="lead">{{ $productos }} {{ Str::plural('producto', $productos) }} &nbsp;·&nbsp; <span class="badge {{ $solicitud->tipo === TipoPedido::Mayorista ? 'badge-mayorista' : 'badge-minorista' }}">{{ $solicitud->tipo->label() }}</span></p>

<table class="datos" width="100%" cellpadding="0" cellspacing="0" role="presentation">
<tr>
<td class="datos-rotulo">Teléfono</td>
<td class="datos-valor"><a href="tel:{{ preg_replace('/[^\d+]/', '', $solicitud->telefono) }}">{{ $solicitud->telefono }}</a></td>
</tr>
@if ($solicitud->localidad)
<tr>
<td class="datos-rotulo">Localidad</td>
<td class="datos-valor">{{ $solicitud->localidad }}</td>
</tr>
@endif
@if ($solicitud->fecha_evento)
<tr>
<td class="datos-rotulo">Fecha del evento</td>
<td class="datos-valor">{{ $solicitud->fecha_evento->format('d/m/Y') }}</td>
</tr>
@endif
</table>

<p class="seccion">Lo que pidió</p>

<table class="items" width="100%" cellpadding="0" cellspacing="0" role="presentation">
<tr>
<th class="items-th">Producto</th>
<th class="items-th items-num">Cantidad</th>
</tr>
@foreach ($solicitud->items as $item)
<tr>
<td class="items-td">{{ $item->product?->nombre ?? 'Producto dado de baja' }}@if ($item->variante)<br><span class="item-detalle">{{ $item->variante }}</span>@endif @if ($item->nota)<br><span class="item-nota">“{{ $item->nota }}”</span>@endif</td>
<td class="items-td items-num">{{ $cantidad($item->cantidad) }} <span class="unidad">{{ $item->product?->unidad->badge() }}</span></td>
</tr>
@endforeach
</table>

@if ($cotizacion && (float) $cotizacion->total > 0)
<table class="cotizacion" width="100%" cellpadding="0" cellspacing="0" role="presentation">
<tr>
<td class="cotizacion-cell">
<p class="cotizacion-rotulo">Borrador listo · {{ $cotizacion->numero }}</p>
<p class="cotizacion-total">{{ Money::format($cotizacion->total) }}</p>
<p class="cotizacion-nota">Calculado con los precios de lista. Revisalo y mandáselo desde el panel; vence el {{ $cotizacion->vence_el->format('d/m/Y') }}.</p>
</td>
</tr>
</table>
@endif

@if ($solicitud->mensaje)
<table class="mensaje" width="100%" cellpadding="0" cellspacing="0" role="presentation">
<tr>
<td class="mensaje-cell">
<p class="mensaje-rotulo">Mensaje del cliente</p>
<p class="mensaje-texto">{!! nl2br(e($solicitud->mensaje)) !!}</p>
</td>
</tr>
</table>
@endif

<table class="acciones" width="100%" cellpadding="0" cellspacing="0" role="presentation">
<tr>
<td align="center">
<a href="{{ $url }}" class="button button-primary" target="_blank" rel="noopener">Ver la solicitud en el panel</a>
</td>
</tr>
@if ($whatsapp)
<tr>
<td align="center" class="acciones-sep">
<a href="{{ $whatsapp }}" class="button button-secundario" target="_blank" rel="noopener">Escribirle por WhatsApp</a>
</td>
</tr>
@endif
</table>

<p class="meta">Recibida el {{ $solicitud->created_at->timezone(config('app.timezone'))->format('d/m/Y \a \l\a\s H:i') }} desde {{ $solicitud->ip ?? 'origen desconocido' }}.</p>
</x-mail::message>
