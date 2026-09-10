<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\Concerns\AvisaFotoDemasiadoPesada;
use App\Support\LimiteSubida;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreSitePhotoRequest extends FormRequest
{
    use AvisaFotoDemasiadoPesada;

    /** La ruta ya vive detrás de `role:admin`; no hay policy porque no hay modelo. */
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
            'imagen' => [
                'required',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:'.LimiteSubida::kb(self::pesoPedidoKb()),
            ],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(fn (Validator $v) => $this->avisarSiLaFotoNoEntro($v));
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return ['imagen' => 'foto'];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'imagen.required' => 'Elegí una foto para subir.',
            'imagen.image' => 'El archivo tiene que ser una imagen.',
            'imagen.mimes' => 'La foto tiene que ser JPG, PNG o WEBP.',
            'imagen.max' => 'La foto no puede pesar más de '.LimiteSubida::texto(self::pesoPedidoKb()).' MB.',
        ];
    }

    /** Lo que pide la app, antes de que PHP diga la suya. */
    protected static function pesoPedidoKb(): int
    {
        return (int) config('fenix.imagen_sitio.peso_max_kb');
    }
}
