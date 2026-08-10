<?php

use App\Enums\QuoteRequestEstado;
use App\Enums\TipoPedido;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quote_requests', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('telefono', 40);
            $table->enum('tipo', array_column(TipoPedido::cases(), 'value'))
                ->default(TipoPedido::Minorista->value);
            $table->string('localidad')->nullable();
            $table->text('mensaje')->nullable();
            $table->date('fecha_evento')->nullable();
            $table->enum('estado', array_column(QuoteRequestEstado::cases(), 'value'))
                ->default(QuoteRequestEstado::Nueva->value);
            $table->string('ip', 45)->nullable();
            $table->timestamps();

            $table->index(['estado', 'created_at']);
        });

        Schema::create('quote_request_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quote_request_id')->constrained('quote_requests')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products')->restrictOnDelete();
            $table->decimal('cantidad', 10, 2);
            $table->string('nota')->nullable();

            $table->index(['quote_request_id', 'product_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quote_request_items');
        Schema::dropIfExists('quote_requests');
    }
};
