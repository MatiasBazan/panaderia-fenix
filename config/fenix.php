<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Casilla de la panadería
    |--------------------------------------------------------------------------
    |
    | Destino de los avisos internos: solicitudes de cotización nuevas y
    | pedidos de alta de comercios.
    |
    */

    'admin_email' => env('FENIX_ADMIN_EMAIL', 'admin@panaderiafenix.com.ar'),

    /*
    |--------------------------------------------------------------------------
    | WhatsApp de pedidos por tipo
    |--------------------------------------------------------------------------
    |
    | Contactos a los que se derivan las solicitudes del público según el tipo
    | de pedido que elige el visitante. Al enviar la solicitud se le abre el
    | chat de wa.me con el detalle ya escrito, listo para tocar enviar.
    | Formato internacional sin "+" ni espacios; para un celular argentino es
    | 54 + 9 + área + número (ej. 3472 52-7326).
    |
    */

    'contactos_pedidos' => [
        'minorista' => [
            'nombre' => 'Nati',
            'whatsapp' => env('FENIX_WHATSAPP_MINORISTAS', '5493472527326'),
        ],
        'mayorista' => [
            'nombre' => 'Juan',
            'whatsapp' => env('FENIX_WHATSAPP_MAYORISTAS', '5493472552461'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Numeración de documentos
    |--------------------------------------------------------------------------
    |
    | Prefijos de cotizaciones y pedidos. El formato final es PREFIJO-AÑO-NNNN.
    |
    */

    'prefijo_cotizacion' => 'COT',
    'prefijo_pedido' => 'PED',

];
