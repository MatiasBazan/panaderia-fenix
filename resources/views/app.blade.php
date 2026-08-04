<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="theme-color" content="#F7F1E3">

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
