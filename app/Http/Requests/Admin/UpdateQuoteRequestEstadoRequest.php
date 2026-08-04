<?php

namespace App\Http\Requests\Admin;

use App\Enums\QuoteRequestEstado;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Cambio manual del estado de una solicitud desde la bandeja.
 * El estado `cotizada` no se toca a mano: lo pone el envío de la cotización.
 */
class UpdateQuoteRequestEstadoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('quoteRequest')) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'estado' => [
                'required',
                Rule::enum(QuoteRequestEstado::class)->except(QuoteRequestEstado::Cotizada),
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'estado' => 'estado',
        ];
    }
}
