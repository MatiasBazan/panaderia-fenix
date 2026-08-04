@php
    use App\Support\Decimal;
    use App\Support\Money;

    $solicitud = $quote->quoteRequest;

    /** Cantidad sin ceros de relleno: 1,50 kg pero 3 unidades. */
    $cantidad = static fn ($valor): string => rtrim(rtrim(number_format((float) $valor, 2, ',', '.'), '0'), ',');
@endphp
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Cotización {{ $quote->numero }}</title>
    <style>
        /* dompdf no lee hojas externas ni variables CSS: todo va literal acá. */
        @page { margin: 28mm 18mm 24mm; }

        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 10.5px;
            color: #241e18;
            line-height: 1.5;
        }

        .cabecera { width: 100%; border-bottom: 2px solid #9a3324; padding-bottom: 10px; }
        .cabecera td { vertical-align: top; }
        .marca { font-size: 20px; font-weight: bold; color: #9a3324; letter-spacing: 0.5px; }
        .marca small { display: block; font-size: 9px; font-weight: normal; color: #6a5f52; letter-spacing: 1.5px; }
        .documento { text-align: right; }
        .documento .numero { font-size: 15px; font-weight: bold; }
        .documento .fecha { color: #6a5f52; font-size: 9.5px; }

        .datos { width: 100%; margin-top: 18px; }
        .datos td { vertical-align: top; width: 50%; padding-right: 12px; }
        .bloque { background: #f7f1e3; border: 1px solid #e5d9c3; padding: 9px 11px; }
        .bloque .rotulo { font-size: 8px; text-transform: uppercase; letter-spacing: 1px; color: #9b8f7e; }
        .bloque .valor { display: block; }

        table.items { width: 100%; border-collapse: collapse; margin-top: 20px; }
        table.items th {
            background: #241e18;
            color: #fffcf5;
            font-size: 8.5px;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            padding: 6px 8px;
            text-align: left;
        }
        table.items td { padding: 6px 8px; border-bottom: 1px solid #e5d9c3; }
        table.items tr:nth-child(even) td { background: #fffcf5; }
        .num { text-align: right; white-space: nowrap; }

        table.totales { width: 46%; margin-left: 54%; margin-top: 12px; border-collapse: collapse; }
        table.totales td { padding: 4px 8px; }
        table.totales .rotulo { color: #6a5f52; }
        table.totales .total td {
            border-top: 2px solid #9a3324;
            font-size: 13px;
            font-weight: bold;
            padding-top: 7px;
        }

        .observaciones { margin-top: 22px; border-left: 3px solid #9a3324; padding: 2px 0 2px 10px; }
        .observaciones .rotulo { font-size: 8px; text-transform: uppercase; letter-spacing: 1px; color: #9b8f7e; }

        .vigencia { margin-top: 20px; background: #f7f1e3; border: 1px solid #e5d9c3; padding: 9px 11px; text-align: center; }

        .pie {
            position: fixed;
            bottom: -14mm;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 8.5px;
            color: #9b8f7e;
            border-top: 1px solid #e5d9c3;
            padding-top: 6px;
        }
    </style>
</head>
<body>
    <table class="cabecera">
        <tr>
            <td>
                <div class="marca">
                    {{ $panaderia['nombre'] ?? config('app.name') }}
                    <small>PANADERÍA ARTESANAL</small>
                </div>
                @if (! empty($panaderia['direccion']))
                    <div>{{ $panaderia['direccion'] }}</div>
                @endif
                @if (! empty($panaderia['telefono']))
                    <div>Tel. {{ $panaderia['telefono'] }}</div>
                @endif
                @if (! empty($panaderia['email']))
                    <div>{{ $panaderia['email'] }}</div>
                @endif
                @if (! empty($panaderia['cuit']))
                    <div>CUIT {{ $panaderia['cuit'] }}</div>
                @endif
            </td>
            <td class="documento">
                <div>COTIZACIÓN</div>
                <div class="numero">{{ $quote->numero }}</div>
                <div class="fecha">
                    Emitida el {{ $quote->created_at?->format('d/m/Y') }}<br>
                    Válida hasta el {{ $quote->vence_el->format('d/m/Y') }}
                </div>
            </td>
        </tr>
    </table>

    <table class="datos">
        <tr>
            <td>
                <div class="bloque">
                    <span class="rotulo">Cliente</span>
                    <strong class="valor">{{ $solicitud->nombre }}</strong>
                    <span class="valor">{{ $solicitud->email }}</span>
                    <span class="valor">{{ $solicitud->telefono }}</span>
                    @if ($solicitud->localidad)
                        <span class="valor">{{ $solicitud->localidad }}</span>
                    @endif
                </div>
            </td>
            <td>
                @if ($solicitud->fecha_evento)
                    <div class="bloque">
                        <span class="rotulo">Fecha del evento</span>
                        <strong class="valor">{{ $solicitud->fecha_evento->format('d/m/Y') }}</strong>
                    </div>
                @endif
            </td>
        </tr>
    </table>

    <table class="items">
        <thead>
            <tr>
                <th>Detalle</th>
                <th class="num">Cant.</th>
                <th class="num">Precio unit.</th>
                <th class="num">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($quote->items as $item)
                <tr>
                    <td>{{ $item->descripcion }}</td>
                    <td class="num">{{ $cantidad($item->cantidad) }}</td>
                    <td class="num">{{ Money::format($item->precio_unitario) }}</td>
                    <td class="num">{{ Money::format($item->subtotal) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <table class="totales">
        <tr>
            <td class="rotulo">Subtotal</td>
            <td class="num">{{ Money::format($quote->subtotal) }}</td>
        </tr>
        @if (! Decimal::isZero($quote->descuento))
            <tr>
                <td class="rotulo">Descuento</td>
                <td class="num">− {{ Money::format($quote->descuento) }}</td>
            </tr>
        @endif
        <tr class="total">
            <td>Total</td>
            <td class="num">{{ Money::format($quote->total) }}</td>
        </tr>
    </table>

    @if ($quote->observaciones)
        <div class="observaciones">
            <span class="rotulo">Observaciones</span>
            <div>{{ $quote->observaciones }}</div>
        </div>
    @endif

    <div class="vigencia">
        Los precios de esta cotización rigen hasta el <strong>{{ $quote->vence_el->format('d/m/Y') }}</strong>.
        Pasada esa fecha, escribinos y la actualizamos.
    </div>

    <div class="pie">
        {{ $panaderia['nombre'] ?? config('app.name') }}
        @if (! empty($panaderia['telefono'])) · {{ $panaderia['telefono'] }} @endif
        @if (! empty($panaderia['email'])) · {{ $panaderia['email'] }} @endif
    </div>
</body>
</html>
