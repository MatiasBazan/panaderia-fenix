<?php

namespace App\Http\Requests\Admin;

use App\Models\Category;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StoreCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Category::class) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'nombre' => ['required', 'string', 'max:80'],
            'slug' => ['required', 'string', 'max:100', 'alpha_dash', Rule::unique(Category::class, 'slug')],
            'orden' => ['required', 'integer', 'min:0', 'max:999'],
            'activo' => ['required', 'boolean'],
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
            'orden' => $this->input('orden', 0),
            'activo' => $this->boolean('activo'),
        ]);
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'nombre' => 'nombre',
            'slug' => 'identificador',
            'orden' => 'orden',
            'activo' => 'estado',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'slug.unique' => 'Ya hay una categoría con ese identificador.',
        ];
    }
}
