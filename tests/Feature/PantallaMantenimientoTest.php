<?php

/**
 * La pantalla de mantenimiento se sirve por dos caminos: Laravel la renderiza
 * como vista 503 y nginx copia el mismo archivo como HTML estático para cuando
 * PHP no responde. Ese segundo camino no compila nada, así que una directiva de
 * Blade que se cuele acá sale impresa en crudo delante del visitante.
 */
it('no tiene nada que compilar: el HTML renderizado es el archivo tal cual', function () {
    $archivo = resource_path('views/errors/503.blade.php');

    expect(trim(view('errors.503')->render()))
        ->toBe(trim((string) file_get_contents($archivo)));
});

it('se muestra cuando la app está en mantenimiento', function () {
    $render = view('errors.503')->render();

    expect($render)
        ->toContain('Estamos actualizando el sitio')
        ->toContain('<meta http-equiv="refresh"')
        // El logo lo sirve nginx desde public/, que sigue arriba con la app caída.
        ->toContain('/img/logo-192.png');
});
