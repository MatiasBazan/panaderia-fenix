<?php

namespace App\Http\Requests\Admin;

use App\Enums\ProductUnidad;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Product::class) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'category_id' => ['required', 'integer', Rule::exists(Category::class, 'id')],
            'sku' => ['required', 'string', 'max:40', 'alpha_dash', Rule::unique(Product::class, 'sku')],
            'nombre' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'alpha_dash', Rule::unique(Product::class, 'slug')],
            'descripcion' => ['nullable', 'string', 'max:2000'],
            'unidad' => ['required', Rule::enum(ProductUnidad::class)],
            // La columna es decimal(10,2): más de dos decimales se rechaza en vez de redondearse solo.
            'precio_base' => ['required', 'numeric', 'decimal:0,2', 'min:0', 'max:99999999.99'],
            'imagen' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'activo' => ['required', 'boolean'],
            'destacado' => ['required', 'boolean'],
            'orden' => ['required', 'integer', 'min:0', 'max:999'],
        ];
    }

    /** El slug se deriva del nombre salvo que el admin escriba uno propio. */
    protected function prepareForValidation(): void
    {
        $nombre = $this->string('nombre')->trim()->toString();
        $slug = $this->string('slug')->trim()->toString();

        $this->merge([
            'nombre' => $nombre,
            'slug' => Str::slug($slug !== '' ? $slug : $nombre),
            'sku' => $this->string('sku')->trim()->upper()->toString(),
            'orden' => $this->input('orden', 0),
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
            'imagen.max' => 'La foto no puede pesar más de 2 MB.',
        ];
    }
}
