<?php

namespace App\Http\Requests\Public;

use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;
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
            'email' => ['required', 'email:rfc', 'max:180'],
            'telefono' => ['required', 'string', 'max:40'],
            'localidad' => ['nullable', 'string', 'max:120'],
            'mensaje' => ['nullable', 'string', 'max:2000'],
            'fecha_evento' => ['nullable', 'date', 'after_or_equal:today'],

            'items' => ['required', 'array', 'min:1', 'max:60'],
            'items.*.product_id' => [
                'required',
                'integer',
                Rule::exists(Product::class, 'id')->where('activo', true),
            ],
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
            'email' => 'correo electrónico',
            'telefono' => 'teléfono',
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
            'fecha_evento.after_or_equal' => 'La fecha del evento no puede ser anterior a hoy.',
        ];
    }
}
