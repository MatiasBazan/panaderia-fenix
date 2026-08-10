<?php

namespace App\Http\Requests\Admin;

use App\Enums\ProductUnidad;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('product')) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        /** @var Product $product */
        $product = $this->route('product');

        return [
            'category_id' => ['required', 'integer', Rule::exists(Category::class, 'id')],
            'sku' => [
                'required', 'string', 'max:40', 'alpha_dash',
                Rule::unique(Product::class, 'sku')->ignoreModel($product),
            ],
            'nombre' => ['required', 'string', 'max:255'],
            'slug' => [
                'required', 'string', 'max:255', 'alpha_dash',
                Rule::unique(Product::class, 'slug')->ignoreModel($product),
            ],
            'descripcion' => ['nullable', 'string', 'max:2000'],
            'unidad' => ['required', Rule::enum(ProductUnidad::class)],
            'precio_base' => ['required', 'numeric', 'decimal:0,2', 'min:0', 'max:99999999.99'],
            'imagen' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
            // Sacar la foto actual sin subir una nueva.
            'eliminar_imagen' => ['required', 'boolean'],
            'activo' => ['required', 'boolean'],
            'destacado' => ['required', 'boolean'],
            'orden' => ['required', 'integer', 'min:0', 'max:999'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $nombre = $this->string('nombre')->trim()->toString();
        $slug = $this->string('slug')->trim()->toString();

        $this->merge([
            'nombre' => $nombre,
            'slug' => Str::slug($slug !== '' ? $slug : $nombre),
            'sku' => $this->string('sku')->trim()->upper()->toString(),
            'orden' => $this->input('orden', 0),
            'eliminar_imagen' => $this->boolean('eliminar_imagen'),
            'activo' => $this->boolean('activo'),
            'destacado' => $this->boolean('destacado'),
        ]);
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'category_id' => 'categoría',
            'sku' => 'código',
            'nombre' => 'nombre',
            'slug' => 'identificador',
            'descripcion' => 'descripción',
            'unidad' => 'unidad de venta',
            'precio_base' => 'precio',
            'imagen' => 'foto',
            'activo' => 'estado',
            'destacado' => 'destacado',
            'orden' => 'orden',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'sku.unique' => 'Ya hay un producto con ese código.',
            'slug.unique' => 'Ya hay un producto con ese identificador.',
            'category_id.exists' => 'La categoría elegida no existe.',
            'precio_base.decimal' => 'El precio admite como mucho dos decimales.',
            'imagen.max' => 'La foto no puede pesar más de 10 MB.',
        ];
    }
}
