<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\PublicProductResource;
use App\Models\Product;
use App\Support\Settings;
use Inertia\Inertia;
use Inertia\Response;

class LandingController extends Controller
{
    public function __invoke(Settings $settings): Response
    {
        $destacados = Product::query()
            ->activos()
            ->destacados()
            ->with('category')
            ->ordenados()
            ->limit(6)
            ->get();

        return Inertia::render('public/landing', [
            'destacados' => PublicProductResource::collection($destacados),
            'panaderia' => $settings->datosPanaderia(),
            'zonas' => $settings->zonasEntrega(),
        ]);
    }
}
