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

    /*
    |--------------------------------------------------------------------------
    | Seña de pedidos
    |--------------------------------------------------------------------------
    |
    | Monto que el cliente debe adelantar para reservar el pedido. Se le avisa
    | en la pantalla de datos y en la de gracias, y va escrito en el mensaje de
    | WhatsApp que se le abre al contacto. En pesos; 0 desactiva el aviso.
    |
    */

    'sena_pedido' => (int) env('FENIX_SENA_PEDIDO', 3000),

    /*
    |--------------------------------------------------------------------------
    | Fotos de producto
    |--------------------------------------------------------------------------
    |
    | Único lugar donde se define el tamaño de las imágenes del catálogo. Lo
    | leen el servicio que las optimiza al subirlas, la validación del formulario
    | y la ayuda que ve el admin (incluido el prompt para la IA). Cambiar acá o
    | en el `.env` alcanza: no hay medidas escritas en ningún otro lado.
    |
    | `ancho_max` acota el original que se ve en la ficha del producto; el
    | thumbnail es el 4:3 recortado que usan las tarjetas y los listados.
    |
    */

    'imagen_producto' => [
        'ancho_max' => (int) env('FENIX_IMG_ANCHO_MAX', 1200),
        'thumb_ancho' => (int) env('FENIX_IMG_THUMB_ANCHO', 400),
        'thumb_alto' => (int) env('FENIX_IMG_THUMB_ALTO', 300),
        'calidad' => (int) env('FENIX_IMG_CALIDAD', 80),
        'peso_max_kb' => (int) env('FENIX_IMG_PESO_MAX_KB', 10240),
    ],

];
