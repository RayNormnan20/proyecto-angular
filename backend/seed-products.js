const { sequelize } = require('./src/config/database');
const { Product, Category, Brand, ProductImage } = require('./src/modules/associations');

async function seedProducts() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos.');

    // Crear o buscar una categoría por defecto
    const [category] = await Category.findOrCreate({
      where: { nombre: 'Ropa General' },
      defaults: { descripcion: 'Categoría para pruebas masivas' }
    });

    // Crear o buscar una marca por defecto
    const [brand] = await Brand.findOrCreate({
      where: { nombre: 'Marca Genérica' },
      defaults: { descripcion: 'Marca para pruebas masivas' }
    });

    // Nombre de imagen existente en backend/public/uploads/products/
    // Asegúrate de que esta imagen exista, si no, usa una URL placeholder externa o copia una imagen
    // Usaremos una de las que vimos en el listado anterior
    const existingImageFilename = 'image-1772844239897-542891401.jpg'; 
    const imageUrl = `/uploads/products/${existingImageFilename}`;

    console.log(`📦 Preparando para insertar 30 productos en la categoría "${category.nombre}" y marca "${brand.nombre}"...`);

    for (let i = 1; i <= 30; i++) {
      const randomPrice = (Math.random() * 200 + 20).toFixed(2);
      const randomStock = Math.floor(Math.random() * 100) + 1;
      
      const product = await Product.create({
        nombre: `Producto de Prueba ${i}`,
        descripcion: `Este es un producto de prueba generado automáticamente (número ${i}). Cuenta con características premium y un diseño moderno.`,
        precio: randomPrice,
        stock: randomStock,
        codigo_sku: `SKU-TEST-${Date.now()}-${i}`,
        estado: 'activo',
        visible_web: true,
        categoria_id: category.id_categoria,
        marca_id: brand.id_marca
      });

      await ProductImage.create({
        producto_id: product.id_producto,
        url: imageUrl
      });
      
      // console.log(`   - Insertado: ${product.nombre}`);
    }

    console.log('✅ 30 productos insertados correctamente con sus imágenes.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al insertar productos:', error);
    process.exit(1);
  }
}

seedProducts();
