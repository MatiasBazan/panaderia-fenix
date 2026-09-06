<?php

namespace Database\Seeders;

use App\Enums\ProductUnidad;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CatalogSeeder extends Seeder
{
    /**
     * Catálogo real de la panadería: categorías y productos con SKU, unidad de
     * venta y precio base. Los precios son de lista; el descuento por comercio
     * se aplica en `PriceCalculator`, nunca acá.
     */
    public function run(): void
    {
        foreach ($this->catalogo() as $orden => $categoria) {
            $category = Category::updateOrCreate(
                ['slug' => Str::slug($categoria['nombre'])],
                [
                    'nombre' => $categoria['nombre'],
                    'orden' => $orden + 1,
                    'activo' => true,
                ],
            );

            foreach ($categoria['productos'] as $i => $producto) {
                Product::updateOrCreate(
                    ['sku' => $producto['sku']],
                    [
                        'category_id' => $category->id,
                        'nombre' => $producto['nombre'],
                        'slug' => Str::slug($producto['nombre']),
                        'descripcion' => $producto['descripcion'],
                        'variantes' => $producto['variantes'] ?? null,
                        'unidad' => $producto['unidad'],
                        'precio_base' => $producto['precio_base'],
                        'imagen' => null,
                        'activo' => $producto['activo'] ?? true,
                        'destacado' => $producto['destacado'] ?? false,
                        'orden' => $i + 1,
                    ],
                );
            }
        }
    }

    /**
     * @return list<array{nombre: string, productos: list<array{sku: string, nombre: string, descripcion: string, variantes?: list<array{nombre: string, opciones: list<array{label: string, precio?: string}>}>, unidad: ProductUnidad, precio_base: string, destacado?: bool, activo?: bool}>}>
     */
    protected function catalogo(): array
    {
        return [
            [
                'nombre' => 'Panes',
                'productos' => [
                    [
                        'sku' => 'PAN-FRA-001',
                        'nombre' => 'Pan francés',
                        'descripcion' => 'Corteza fina y crocante, miga aireada. Horneado tres veces por día.',
                        'unidad' => ProductUnidad::Kg,
                        'precio_base' => '3200.00',
                        'destacado' => true,
                    ],
                    [
                        'sku' => 'PAN-CAM-002',
                        'nombre' => 'Pan de campo',
                        'descripcion' => 'Masa madre de fermentación lenta, 18 horas de reposo. Pieza de 800 g.',
                        'unidad' => ProductUnidad::Unidad,
                        'precio_base' => '4800.00',
                        'destacado' => true,
                    ],
                    [
                        'sku' => 'PAN-MIG-003',
                        'nombre' => 'Pan de miga',
                        'descripcion' => 'Plancha sin corteza para sándwiches. Blanco o negro.',
                        'unidad' => ProductUnidad::Unidad,
                        'precio_base' => '6500.00',
                    ],
                    [
                        'sku' => 'PAN-SAL-004',
                        'nombre' => 'Pan de salvado',
                        'descripcion' => 'Harina integral y salvado de trigo. Pieza de 600 g.',
                        'unidad' => ProductUnidad::Unidad,
                        'precio_base' => '4200.00',
                    ],
                    [
                        'sku' => 'PAN-FEL-005',
                        'nombre' => 'Felipes',
                        'descripcion' => 'Panecillos individuales de miga tierna, ideales para copetín.',
                        'unidad' => ProductUnidad::Docena,
                        'precio_base' => '5600.00',
                    ],
                    [
                        'sku' => 'PAN-VIE-006',
                        'nombre' => 'Pan viena',
                        'descripcion' => 'Corteza brillante y miga suave, con un punto de manteca.',
                        'unidad' => ProductUnidad::Kg,
                        'precio_base' => '3900.00',
                    ],
                ],
            ],
            [
                'nombre' => 'Facturas',
                'productos' => [
                    [
                        'sku' => 'FAC-SUR-001',
                        'nombre' => 'Facturas surtidas',
                        'descripcion' => 'Medialunas, vigilantes, cañoncitos y libritos. Docena mixta.',
                        'unidad' => ProductUnidad::Docena,
                        'precio_base' => '9800.00',
                        'destacado' => true,
                    ],
                    [
                        'sku' => 'FAC-MED-002',
                        'nombre' => 'Medialunas de manteca',
                        'descripcion' => 'Hojaldre de manteca con almíbar. Las de siempre.',
                        'unidad' => ProductUnidad::Docena,
                        'precio_base' => '10500.00',
                        'destacado' => true,
                    ],
                    [
                        'sku' => 'FAC-MGR-003',
                        'nombre' => 'Medialunas de grasa',
                        'descripcion' => 'Saladas, chicas, para acompañar el mate.',
                        'unidad' => ProductUnidad::Docena,
                        'precio_base' => '8200.00',
                    ],
                    [
                        'sku' => 'FAC-CAN-004',
                        'nombre' => 'Cañoncitos de dulce de leche',
                        'descripcion' => 'Hojaldre relleno el mismo día del horneado.',
                        'unidad' => ProductUnidad::Docena,
                        'precio_base' => '11200.00',
                    ],
                ],
            ],
            [
                'nombre' => 'Criollos',
                'productos' => [
                    [
                        'sku' => 'CRI-HOJ-001',
                        'nombre' => 'Criollos hojaldrados',
                        'descripcion' => 'Grasa vacuna y sal gruesa. Se venden por kilo.',
                        'unidad' => ProductUnidad::Kg,
                        'precio_base' => '8900.00',
                        'destacado' => true,
                    ],
                    [
                        'sku' => 'CRI-CAS-002',
                        'nombre' => 'Criollos caseros',
                        'descripcion' => 'Más gruesos, de miga compacta. Para el mate de la tarde.',
                        'unidad' => ProductUnidad::Kg,
                        'precio_base' => '8400.00',
                    ],
                    [
                        'sku' => 'CRI-GRI-003',
                        'nombre' => 'Grisines artesanales',
                        'descripcion' => 'Finos y quebradizos, con semillas de sésamo.',
                        'unidad' => ProductUnidad::Kg,
                        'precio_base' => '9600.00',
                    ],
                ],
            ],
            [
                'nombre' => 'Pastelería',
                'productos' => [
                    [
                        'sku' => 'PAS-TOR-001',
                        'nombre' => 'Torta de chocolate',
                        'descripcion' => 'Tres capas de bizcochuelo con ganache. Base de 24 cm.',
                        'unidad' => ProductUnidad::Unidad,
                        'precio_base' => '28000.00',
                        'destacado' => true,
                    ],
                    [
                        'sku' => 'PAS-TRO-002',
                        'nombre' => 'Torta rogel',
                        'descripcion' => 'Capas finas de hojaldre, dulce de leche y merengue italiano.',
                        'unidad' => ProductUnidad::Unidad,
                        'precio_base' => '32000.00',
                    ],
                    [
                        'sku' => 'PAS-LEM-003',
                        'nombre' => 'Lemon pie',
                        'descripcion' => 'Masa sablée, curd de limón y merengue quemado.',
                        'unidad' => ProductUnidad::Unidad,
                        'precio_base' => '26500.00',
                    ],
                    [
                        'sku' => 'PAS-ALF-004',
                        'nombre' => 'Alfajores',
                        'descripcion' => 'Rellenos de dulce de leche repostero. Elegí el relleno y el tamaño.',
                        'variantes' => [
                            [
                                'nombre' => 'Relleno',
                                'opciones' => [
                                    ['label' => 'Chocolate'],
                                    ['label' => 'Maicena'],
                                ],
                            ],
                            [
                                'nombre' => 'Tamaño',
                                'opciones' => [
                                    ['label' => 'Grande', 'precio' => '1500.00'],
                                    ['label' => 'Chico', 'precio' => '900.00'],
                                ],
                            ],
                        ],
                        'unidad' => ProductUnidad::Docena,
                        'precio_base' => '12800.00',
                    ],
                    [
                        'sku' => 'PAS-PAF-006',
                        'nombre' => 'Pastafloras',
                        'descripcion' => 'Masa sablée dulce. Elegí el sabor del relleno.',
                        'variantes' => [
                            [
                                'nombre' => 'Sabor',
                                'opciones' => [
                                    ['label' => 'Membrillo'],
                                    ['label' => 'Dulce de leche'],
                                    ['label' => 'Batata'],
                                ],
                            ],
                        ],
                        'unidad' => ProductUnidad::Unidad,
                        'precio_base' => '8500.00',
                    ],
                    [
                        'sku' => 'PAS-MAS-005',
                        'nombre' => 'Masas finas surtidas',
                        'descripcion' => 'Bandeja de 24 piezas para mesa dulce.',
                        'unidad' => ProductUnidad::Bandeja,
                        'precio_base' => '34000.00',
                    ],
                ],
            ],
            [
                'nombre' => 'Salados',
                'productos' => [
                    [
                        'sku' => 'SAL-PRE-001',
                        'nombre' => 'Prepizzas',
                        'descripcion' => 'Masa precocida de 30 cm, lista para armar.',
                        'unidad' => ProductUnidad::Unidad,
                        'precio_base' => '3400.00',
                        'destacado' => true,
                    ],
                    [
                        'sku' => 'SAL-EMP-002',
                        'nombre' => 'Empanadas de carne',
                        'descripcion' => 'Corte a cuchillo, repulgue cordobés. Crudas o cocidas.',
                        'unidad' => ProductUnidad::Docena,
                        'precio_base' => '15600.00',
                    ],
                    [
                        'sku' => 'SAL-TAR-003',
                        'nombre' => 'Tartas saladas',
                        'descripcion' => 'Jamón y queso, verdura o calabaza. Molde de 26 cm.',
                        'unidad' => ProductUnidad::Unidad,
                        'precio_base' => '14500.00',
                    ],
                    [
                        'sku' => 'SAL-SAN-004',
                        'nombre' => 'Sándwiches de miga',
                        'descripcion' => 'Bandeja de 48 triples, jamón y queso.',
                        'unidad' => ProductUnidad::Bandeja,
                        'precio_base' => '29800.00',
                    ],
                    [
                        'sku' => 'SAL-CHI-005',
                        'nombre' => 'Chipá',
                        'descripcion' => 'Almidón de mandioca y queso. Se hornea a pedido.',
                        'unidad' => ProductUnidad::Kg,
                        'precio_base' => '11400.00',
                        'activo' => false,
                    ],
                ],
            ],
        ];
    }
}
