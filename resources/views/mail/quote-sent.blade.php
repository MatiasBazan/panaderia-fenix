<x-mail::message>
# Tu cotización {{ $quote->numero }}

Hola {{ $solicitud->nombre }}, preparamos la cotización que nos pediste.
Va adjunta en PDF y también te la dejamos acá abajo.

<x-mail::table>
| Producto | Cantidad | Precio | Subtotal |
| :------- | -------: | -----: | -------: |
@foreach ($quote->items as $item)
| {{ $item->descripcion }} | {{ rtrim(rtrim(number_format((float) $item->cantidad, 2, ',', '.'), '0'), ',') }} | {{ \App\Support\Money::format($item->precio_unitario) }} | {{ \App\Support\Money::format($item->subtotal) }} |
@endforeach
</x-mail::table>

<x-mail::panel>
**Subtotal:** {{ \App\Support\Money::format($quote->subtotal) }}
@if (! \App\Support\Decimal::isZero($quote->descuento))

**Descuento:** − {{ \App\Support\Money::format($quote->descuento) }}
@endif

**Total: {{ \App\Support\Money::format($quote->total) }}**

Válida hasta el {{ $quote->vence_el->format('d/m/Y') }}.
</x-mail::panel>

@if ($quote->observaciones)
**Observaciones**

{{ $quote->observaciones }}
@endif

Cualquier duda respondé este mail y lo vemos.

Gracias,<br>
{{ config('app.name') }}

<x-mail::subcopy>
Los precios de esta cotización rigen hasta el {{ $quote->vence_el->format('d/m/Y') }}.
Pasada esa fecha, escribinos y la actualizamos.
</x-mail::subcopy>
</x-mail::message>
