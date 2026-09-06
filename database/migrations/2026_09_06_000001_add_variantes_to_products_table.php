<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Grupos de opciones que el cliente elige sobre una misma foto:
            // [{nombre, opciones: [{label, precio?}]}]. El `precio` es interno.
            $table->json('variantes')->nullable()->after('descripcion');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('variantes');
        });
    }
};
