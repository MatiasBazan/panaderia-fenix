<?php

namespace App\Http\Requests\Admin;

use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Edición del borrador de una cotización: sus ítems, el descuento y la vigencia.
 * Los totales no se reciben del navegador, se recalculan en el servidor.
 */
class UpdateQuoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('quote')) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'vence_el' => ['required', 'date', 'after_or_equal:today'],
            'observaciones' => ['nullable', 'string', 'max:2000'],
            'descuento' => ['required', 'numeric', 'decimal:0,2', 'min:0', 'max:9999999999.99'],

            'items' => ['required', 'array', 'min:1', 'max:100'],
            // Nullable: la cotización admite ítems libres que no están en el catálogo.
            'items.*.product_id' => ['nullable', 'integer', Rule::exists(Product::class, 'id')],
            'items.*.descripcion' => ['required', 'string', 'max:255'],
            'items.*.cantidad' => ['required', 'numeric', 'decimal:0,2', 'min:0.01', 'max:9999'],
            'items.*.precio_unitario' => ['required', 'numeric', 'decimal:0,2', 'min:0', 'max:99999999.99'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'descuento' => $this->input('descuento', '0.00'),
        ]);
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'vence_el' => 'fecha de vencimiento',
            'observaciones' => 'observaciones',
            'descuento' => 'descuento',
            'items' => 'lista de ítems',
            'items.*.descripcion' => 'descripción del ítem',
            'items.*.cantidad' => 'cantidad',
            'items.*.precio_unitario' => 'precio unitario',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'items.required' => 'La cotización necesita al menos un ítem.',
            'items.min' => 'La cotización necesita al menos un ítem.',
            'items.*.product_id.exists' => 'Uno de los productos ya no existe.',
            'vence_el.after_or_equal' => 'La cotización no puede vencer antes de hoy.',
        ];
    }
}
