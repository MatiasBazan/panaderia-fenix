<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * Tabla clave-valor de configuración. El acceso tipado va por `App\Support\Settings`.
 *
 * @property int $id
 * @property string $clave
 * @property mixed $valor
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['clave', 'valor'])]
class Setting extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'valor' => 'array',
        ];
    }
}
