<?php

namespace Database\Seeders;

use App\Support\Settings;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    public function __construct(protected Settings $settings) {}

    public function run(): void
    {
        $this->settings->setMany([
            Settings::HORA_CORTE_PEDIDOS => '18:00',
            Settings::DIAS_ANTICIPACION_MINIMA => 1,
            Settings::MONTO_MINIMO_PEDIDO => '25000.00',
            Settings::ZONAS_ENTREGA => [
                'Córdoba Capital',
                'Villa Allende',
                'Unquillo',
                'Alta Gracia',
                'Villa Carlos Paz',
            ],
            Settings::DATOS_PANADERIA => [
                'nombre' => 'Panadería Fénix',
                'direccion' => 'Av. Colón 1450, Córdoba',
                'telefono' => '351-422-8890',
                'whatsapp' => '351-6-22-8890',
                'email' => 'hola@panaderiafenix.com.ar',
                'horarios' => [
                    ['dias' => 'Lunes a viernes', 'horario' => '06:00 a 13:00 y 16:30 a 20:30'],
                    ['dias' => 'Sábados', 'horario' => '06:00 a 13:30'],
                    ['dias' => 'Domingos', 'horario' => '07:00 a 12:30'],
                ],
                'mapa' => ['lat' => -31.4135, 'lng' => -64.1918],
                'redes' => [
                    'instagram' => 'https://instagram.com/panaderiafenix',
                    'facebook' => 'https://facebook.com/panaderiafenix',
                ],
            ],
        ]);
    }
}
