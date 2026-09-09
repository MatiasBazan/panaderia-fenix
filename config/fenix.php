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
    | Fotos de la landing
    |--------------------------------------------------------------------------
    |
    | Los huecos de foto del sitio público. Esta lista es la fuente única: de
    | acá salen el formulario del admin, la validación de la subida y el orden
    | en que se muestran. Agregar un hueco es agregar una entrada — no hay
    | nombres de slot escritos en ningún otro lado del backend.
    |
    | `ancho` es el ancho al que se guarda el WebP; `proporcion` es sólo la
    | ayuda que lee el admin al subir. Si un hueco no tiene foto cargada, el
    | sitio sigue mostrando el placeholder rayado.
    |
    */

    'fotos_landing' => [
        'mostrador' => [
            'label' => 'Mostrador con pan recién horneado',
            'ayuda' => 'La foto grande del encabezado. Es lo primero que se ve al entrar.',
            'proporcion' => '3:2',
            'ancho' => 1600,
        ],
        'miga' => [
            'label' => 'Detalle de la miga',
            'ayuda' => 'La foto chica que se superpone al encabezado. Un primer plano funciona mejor que un plano general.',
            'proporcion' => '1:1',
            'ancho' => 800,
        ],
        'amasado' => [
            'label' => 'Amasado a mano',
            'ayuda' => 'Acompaña a «Una panadería familiar», en el medio de la página.',
            'proporcion' => '4:3',
            'ancho' => 1200,
        ],
    ],

    'imagen_sitio' => [
        'calidad' => (int) env('FENIX_IMG_SITIO_CALIDAD', 82),
        'peso_max_kb' => (int) env('FENIX_IMG_SITIO_PESO_MAX_KB', 15360),
    ],

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
        'peso_max_kb' => (int) env('FENIX_IMG_PESO_MAX_KB', 15360),
    ],

];
