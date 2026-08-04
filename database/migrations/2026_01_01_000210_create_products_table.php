<?php

use App\Enums\ProductUnidad;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('categories')->restrictOnDelete();
            $table->string('sku', 40)->unique();
            $table->string('nombre');
            $table->string('slug')->unique();
            $table->text('descripcion')->nullable();
            $table->enum('unidad', array_column(ProductUnidad::cases(), 'value'));
            $table->decimal('precio_base', 10, 2);
            $table->string('imagen')->nullable();
            $table->boolean('activo')->default(true);
            $table->boolean('destacado')->default(false);
            $table->unsignedInteger('orden')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['activo', 'orden']);
            $table->index(['destacado', 'activo']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
