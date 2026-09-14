<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Un producto cuyo tamaño fija el precio no necesita precio general:
            // queda sólo como respaldo para las opciones sin precio.
            $table->decimal('precio_base', 10, 2)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('precio_base', 10, 2)->nullable(false)->change();
        });
    }
};
