<?php

namespace App\Http\Resources;

use App\Models\Product;
use App\Services\ProductImageService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Producto tal como lo ve el admin. A diferencia de {@see PublicProductResource},
 * acá SÍ viaja `precio_base` y los campos de gestión (estado, orden, sku). Solo
 * se usa detrás de `role:admin`.
 *
 * @mixin Product
 */
class AdminProductResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'category_id' => $this->category_id,
            'sku' => $this->sku,
            'nombre' => $this->nombre,
            'slug' => $this->slug,
            'descripcion' => $this->descripcion,
            // Crudo, con el precio de referencia interno: solo lo ve el admin.
            'variantes' => $this->variantes ?? [],
            'unidad' => $this->unidad->value,
            'unidad_label' => $this->unidad->label(),
            'precio_base' => (string) $this->precio_base,
            'imagen' => $this->imagen === null ? null : asset('storage/'.$this->imagen),
            'imagen_thumb' => $this->imagen === null
                ? null
                : asset('storage/'.ProductImageService::thumbDe($this->imagen)),
            'activo' => $this->activo,
            'destacado' => $this->destacado,
            'orden' => $this->orden,
            'categoria' => $this->whenLoaded('category', fn (): array => [
                'id' => $this->category->id,
                'nombre' => $this->category->nombre,
                'slug' => $this->category->slug,
            ]),
        ];
    }
}
