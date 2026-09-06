<?php

namespace App\Http\Resources;

use App\Models\Product;
use App\Services\ProductImageService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Producto tal como lo ve un visitante anónimo.
 *
 * Este Resource NO expone `precio_base` ni ningún derivado suyo, y es el único
 * camino por el que un producto llega a una respuesta pública. Si mañana hace
 * falta un dato nuevo en el catálogo, se agrega acá — nunca se devuelve el
 * modelo crudo.
 *
 * @mixin Product
 */
class PublicProductResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'sku' => $this->sku,
            'nombre' => $this->nombre,
            'slug' => $this->slug,
            'descripcion' => $this->descripcion,
            // Solo el nombre del grupo y las etiquetas: el precio de cada opción
            // es interno y no puede filtrarse por la cara pública.
            'variantes' => collect($this->variantes ?? [])
                ->map(fn (array $grupo): array => [
                    'nombre' => $grupo['nombre'],
                    'opciones' => collect($grupo['opciones'])
                        ->map(fn (array $opcion): array => [
                            'label' => $opcion['label'],
                        ])
                        ->values()
                        ->all(),
                ])
                ->values()
                ->all(),
            'unidad' => $this->unidad->value,
            'unidad_label' => $this->unidad->label(),
            'imagen' => $this->imagen === null ? null : asset('storage/'.$this->imagen),
            'imagen_thumb' => $this->imagen === null
                ? null
                : asset('storage/'.ProductImageService::thumbDe($this->imagen)),
            'destacado' => $this->destacado,
            'categoria' => $this->whenLoaded('category', fn (): array => [
                'nombre' => $this->category->nombre,
                'slug' => $this->category->slug,
            ]),
        ];
    }
}
