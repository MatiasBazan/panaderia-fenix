<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="theme-color" content="#F7F1E3">
        <meta name="description" content="Panadería de barrio en Leones, Córdoba, desde 1987. Pan de masa madre, facturas de manteca y pastelería del día. Armá tu pedido y te pasamos los precios.">

        <meta property="og:type" content="website">
        <meta property="og:site_name" content="{{ config('app.name', 'Panadería Fénix') }}">
        <meta property="og:title" content="Panadería Fénix · Pan de masa madre en Leones">
        <meta property="og:description" content="Horneamos todos los días desde 1987. Armá tu pedido mayorista y te pasamos los precios dentro de las 24 horas hábiles.">
        <meta property="og:image" content="{{ url('/img/logo-768.png') }}">
        <meta property="og:url" content="{{ url()->current() }}">
        <meta name="twitter:card" content="summary_large_image">

        {{-- Fondo aplicado antes del CSS para evitar el flash blanco. --}}
        <style>
            html { background-color: #F7F1E3; }
        </style>

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ config('app.name', 'Panadería Fénix') }}</title>
        </x-inertia::head>
    </head>
    <body class="bg-crema font-sans text-texto antialiased">
        <x-inertia::app />
    </body>
</html>
