<x-mail::layout>
{{-- Las fuentes de la marca: Apple Mail y algunos clientes las cargan; el
     resto cae en Georgia / Helvetica, definidos en el tema. --}}
<x-slot:head>
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Work+Sans:wght@400;600&display=swap" rel="stylesheet">
</x-slot:head>

{{-- Header --}}
<x-slot:header>
<x-mail::header :url="config('app.url')">
{{-- URL absoluta: el cliente de correo no conoce el sitio. Versión con
     transparencia y al doble del tamaño mostrado, para pantallas retina. --}}
<img src="{{ rtrim(config('app.url'), '/') }}/img/logo-384.png" class="logo" width="112" height="84" alt="{{ config('app.name') }}">
<span class="wordmark">{{ config('app.name') }}</span>
</x-mail::header>
</x-slot:header>

{{-- Body --}}
{!! $slot !!}

{{-- Subcopy --}}
@isset($subcopy)
<x-slot:subcopy>
<x-mail::subcopy>
{!! $subcopy !!}
</x-mail::subcopy>
</x-slot:subcopy>
@endisset

{{-- Footer --}}
<x-slot:footer>
<x-mail::footer>
{{ config('app.name') }} · Leones, Córdoba

Aviso automático del sitio. Horneamos todos los días, incluso los domingos.
</x-mail::footer>
</x-slot:footer>
</x-mail::layout>
