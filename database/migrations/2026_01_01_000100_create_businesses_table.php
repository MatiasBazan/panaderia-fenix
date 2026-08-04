<?php

use App\Enums\BusinessEstado;
use App\Enums\CondicionIva;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('businesses', function (Blueprint $table) {
            $table->id();
            $table->string('razon_social');
            $table->string('nombre_fantasia')->nullable();
            $table->string('cuit', 13)->unique();
            $table->enum('condicion_iva', array_column(CondicionIva::cases(), 'value'));
            $table->string('direccion');
            $table->string('localidad');
            $table->string('telefono', 40);
            $table->string('email_contacto');
            $table->decimal('descuento_porcentaje', 5, 2)->default(0);
            $table->decimal('limite_credito', 12, 2)->nullable();
            // Caché del saldo. La verdad vive en `account_movements`.
            $table->decimal('saldo_actual', 12, 2)->default(0);
            $table->enum('estado', array_column(BusinessEstado::cases(), 'value'))
                ->default(BusinessEstado::Pendiente->value);
            $table->text('notas_internas')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('estado');
            $table->index('razon_social');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('businesses');
    }
};
