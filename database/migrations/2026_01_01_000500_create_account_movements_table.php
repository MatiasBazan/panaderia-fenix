<?php

use App\Enums\MovementTipo;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('account_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('businesses')->restrictOnDelete();
            $table->enum('tipo', array_column(MovementTipo::cases(), 'value'));
            $table->string('concepto');
            $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
            // Siempre positivo: el signo lo define `tipo`.
            $table->decimal('monto', 12, 2);
            $table->date('fecha');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            // Los movimientos no se editan ni se borran: se anulan con uno inverso.
            $table->foreignId('movimiento_anulado_id')->nullable()
                ->constrained('account_movements')->nullOnDelete();
            $table->timestamp('created_at')->nullable();

            $table->index(['business_id', 'fecha']);
            $table->index('order_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('account_movements');
    }
};
