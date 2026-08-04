<?php

use App\Enums\FranjaEntrega;
use App\Enums\OrderEstado;
use App\Enums\ProductUnidad;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('businesses')->restrictOnDelete();
            $table->string('numero', 20)->unique();
            $table->date('fecha_entrega');
            $table->enum('franja_entrega', array_column(FranjaEntrega::cases(), 'value'))->nullable();
            $table->enum('estado', array_column(OrderEstado::cases(), 'value'))
                ->default(OrderEstado::Pendiente->value);
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('descuento', 12, 2)->default(0);
            $table->decimal('total', 12, 2)->default(0);
            $table->text('observaciones')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['business_id', 'created_at']);
            $table->index(['estado', 'fecha_entrega']);
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products')->restrictOnDelete();
            // Snapshots: un pedido histórico nunca se recalcula con datos actuales.
            $table->string('nombre_producto');
            $table->enum('unidad', array_column(ProductUnidad::cases(), 'value'));
            $table->decimal('cantidad', 10, 2);
            $table->decimal('precio_unitario', 10, 2);
            $table->decimal('subtotal', 12, 2);

            $table->index('order_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
    }
};
