<?php

namespace App\Http\Requests\Public;

use App\Enums\TipoPedido;
use App\Models\Product;
use App\Support\Settings;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

class StoreQuoteRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            // Honeypot: un humano nunca ve este campo, así que nunca lo completa.
            'sitio_web' => ['prohibited'],

            'nombre' => ['required', 'string', 'max:120'],
            'telefono' => ['required', 'string', 'max:40'],
            'tipo' => ['required', Rule::enum(TipoPedido::class)],
            'localidad' => ['nullable', 'string', 'max:120'],
            'mensaje' => ['nullable', 'string', 'max:2000'],
            'fecha_evento' => [
                'nullable',
                'date',
                'after_or_equal:'.$this->primeraFechaPosible()->toDateString(),
            ],

            'items' => ['required', 'array', 'min:1', 'max:60'],
            'items.*.product_id' => [
                'required',
                'integer',
                Rule::exists(Product::class, 'id')->where('activo', true),
            ],
            'items.*.variante' => ['nullable', 'string', 'max:120'],
            'items.*.cantidad' => ['required', 'numeric', 'min:0.01', 'max:9999'],
            'items.*.nota' => ['nullable', 'string', 'max:180'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'nombre' => 'nombre',
            'telefono' => 'teléfono',
            'tipo' => 'tipo de pedido',
            'localidad' => 'localidad',
            'mensaje' => 'mensaje',
            'fecha_evento' => 'fecha del evento',
            'items' => 'lista de productos',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'sitio_web.prohibited' => 'No pudimos procesar el formulario. Volvé a intentarlo.',
            'items.required' => 'Agregá al menos un producto antes de pedir la cotización.',
            'items.min' => 'Agregá al menos un producto antes de pedir la cotización.',
            'items.*.product_id.exists' => 'Uno de los productos ya no está disponible.',
            'fecha_evento.after_or_equal' => $this->avisoDeAnticipacion(),
        ];
    }

    /**
     * Primer día para el que se puede pedir.
     *
     * La anticipación sale de `settings` y no de un número escrito acá: es el
     * mismo valor que el sitio le muestra al visitante, así que si mañana la
     * panadería pide tres días, el formulario y la validación se mueven juntos.
     */
    private function primeraFechaPosible(): Carbon
    {
        return Carbon::today()->addDays($this->diasDeAnticipacion());
    }

    private function diasDeAnticipacion(): int
    {
        return app(Settings::class)->diasAnticipacionMinima();
    }

    private function avisoDeAnticipacion(): string
    {
        $dias = $this->diasDeAnticipacion();

        $anticipacion = $dias === 1
            ? 'un día de anticipación'
            : $dias.' días de anticipación';

        return 'Los pedidos se toman con '.$anticipacion.'. Elegí una fecha desde el '
            .$this->primeraFechaPosible()->format('d/m').'.';
    }
}
