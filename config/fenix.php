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
    | Numeración de documentos
    |--------------------------------------------------------------------------
    |
    | Prefijos de cotizaciones y pedidos. El formato final es PREFIJO-AÑO-NNNN.
    |
    */

    'prefijo_cotizacion' => 'COT',
    'prefijo_pedido' => 'PED',

];
