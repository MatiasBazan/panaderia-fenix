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
            // Localidades aledañas a Leones (este de Córdoba, dptos. Marcos
            // Juárez y Unión), ordenadas más o menos por cercanía. El formulario
            // público suma "Otra" al final por si la localidad no está.
            Settings::ZONAS_ENTREGA => [
                'Leones',
                'Marcos Juárez',
                'Bell Ville',
                'San Marcos Sud',
                'Noetinger',
            ],
            Settings::DATOS_PANADERIA => [
                'nombre' => 'Panadería Fénix',
                'direccion' => 'Benvenuto 1380, Leones, Córdoba',
                'email' => 'hola@panaderiafenix.com.ar',
                // Se atiende por WhatsApp: cada contacto abre un chat wa.me.
                'contactos' => [
                    ['nombre' => 'Naty', 'telefono' => '3472 52-7326', 'whatsapp' => '5493472527326'],
                    ['nombre' => 'Juan', 'telefono' => '3472 55-2461', 'whatsapp' => '5493472552461'],
                ],
                'horarios' => [
                    ['dias' => 'Lunes a Sábados', 'horario' => '07:00 a 12:30 y 16:00 a 20:00'],
                    ['dias' => 'Domingos', 'horario' => '08:00 a 12:30 y 16:00 a 20:00'],
                ],
                // Panadería "FENIX", Leones (coordenadas del pin de Google Maps).
                'mapa' => ['lat' => -32.6514402, 'lng' => -62.301076],
                'mapa_url' => 'https://maps.app.goo.gl/GkoCWouUL5uLGESt8',
            ],
        ]);
    }
}
