<?php

use App\Support\Settings;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * La panadería toma los pedidos con dos días de anticipación, no con uno.
 *
 * El valor arrancó en 1 y el seeder ya pide 2, pero `db:seed` no se corre en
 * cada deploy: los entornos levantados antes siguen con el 1 guardado, y ese
 * número es el que el sitio le muestra al visitante ("los pedidos se toman con
 * un día de anticipación") y el que valida el formulario. Esta migración los
 * empareja.
 *
 * Sólo sube: si la panadería configuró más días desde el admin, se respeta.
 */
return new class extends Migration
{
    private const MINIMO = 2;

    public function up(): void
    {
        $guardado = DB::table('settings')
            ->where('clave', Settings::DIAS_ANTICIPACION_MINIMA)
            ->value('valor');

        if ($guardado !== null && $this->dias($guardado) >= self::MINIMO) {
            return;
        }

        DB::table('settings')->updateOrInsert(
            ['clave' => Settings::DIAS_ANTICIPACION_MINIMA],
            [
                'valor' => json_encode(['v' => self::MINIMO]),
                'updated_at' => now(),
                'created_at' => now(),
            ],
        );

        // El valor vive cacheado para siempre: sin esto, la app sigue leyendo
        // el 1 hasta que alguien toque settings desde el admin.
        app(Settings::class)->flush();
    }

    public function down(): void
    {
        // Volver a un día sería reintroducir el dato equivocado; el valor se
        // cambia desde settings, no revirtiendo esta migración.
    }

    private function dias(mixed $valor): int
    {
        $decodificado = is_string($valor) ? json_decode($valor, true) : $valor;

        return (int) (is_array($decodificado) ? ($decodificado['v'] ?? 0) : $decodificado);
    }
};
