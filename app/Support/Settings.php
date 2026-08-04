<?php

namespace App\Support;

use App\Models\Setting;
use Illuminate\Support\Facades\Cache;

/**
 * Acceso tipado a la tabla `settings`.
 *
 * El valor se guarda siempre envuelto en JSON (`{"v": ...}`) para que escalares,
 * listas y objetos usen la misma columna sin ambigüedad.
 */
class Settings
{
    public const CACHE_KEY = 'fenix.settings';

    public const HORA_CORTE_PEDIDOS = 'hora_corte_pedidos';

    public const DIAS_ANTICIPACION_MINIMA = 'dias_anticipacion_minima';

    public const MONTO_MINIMO_PEDIDO = 'monto_minimo_pedido';

    public const ZONAS_ENTREGA = 'zonas_entrega';

    public const DATOS_PANADERIA = 'datos_panaderia';

    /**
     * Valores por defecto, usados cuando la clave todavía no está en la base.
     *
     * @var array<string, mixed>
     */
    public const DEFAULTS = [
        self::HORA_CORTE_PEDIDOS => '18:00',
        self::DIAS_ANTICIPACION_MINIMA => 1,
        self::MONTO_MINIMO_PEDIDO => '0.00',
        self::ZONAS_ENTREGA => [],
        self::DATOS_PANADERIA => [],
    ];

    public function get(string $clave, mixed $default = null): mixed
    {
        $all = $this->all();

        return $all[$clave] ?? $default ?? self::DEFAULTS[$clave] ?? null;
    }

    public function set(string $clave, mixed $valor): void
    {
        Setting::updateOrCreate(['clave' => $clave], ['valor' => ['v' => $valor]]);

        $this->flush();
    }

    /**
     * @param  array<string, mixed>  $valores
     */
    public function setMany(array $valores): void
    {
        foreach ($valores as $clave => $valor) {
            Setting::updateOrCreate(['clave' => $clave], ['valor' => ['v' => $valor]]);
        }

        $this->flush();
    }

    /**
     * @return array<string, mixed>
     */
    public function all(): array
    {
        return Cache::rememberForever(self::CACHE_KEY, function (): array {
            return Setting::query()
                ->pluck('valor', 'clave')
                ->map(fn (mixed $valor): mixed => is_array($valor) && array_key_exists('v', $valor) ? $valor['v'] : $valor)
                ->all();
        });
    }

    public function flush(): void
    {
        Cache::forget(self::CACHE_KEY);
    }

    /** Hora de corte en formato `HH:MM`. */
    public function horaCortePedidos(): string
    {
        return (string) $this->get(self::HORA_CORTE_PEDIDOS);
    }

    public function diasAnticipacionMinima(): int
    {
        return (int) $this->get(self::DIAS_ANTICIPACION_MINIMA);
    }

    /** Monto mínimo como string decimal, para no perder precisión. */
    public function montoMinimoPedido(): string
    {
        return number_format((float) $this->get(self::MONTO_MINIMO_PEDIDO), 2, '.', '');
    }

    /**
     * @return list<string>
     */
    public function zonasEntrega(): array
    {
        return array_values(array_map(
            static fn (mixed $zona): string => (string) $zona,
            (array) $this->get(self::ZONAS_ENTREGA),
        ));
    }

    /**
     * @return array<string, mixed>
     */
    public function datosPanaderia(): array
    {
        /** @var array<string, mixed> $datos */
        $datos = (array) $this->get(self::DATOS_PANADERIA);

        return $datos;
    }
}
