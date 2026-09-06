<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('quote_request_items', function (Blueprint $table) {
            // La variante concreta que eligió el cliente, ej. «Chocolate · Grande».
            $table->string('variante', 120)->nullable()->after('product_id');
        });
    }

    public function down(): void
    {
        Schema::table('quote_request_items', function (Blueprint $table) {
            $table->dropColumn('variante');
        });
    }
};
