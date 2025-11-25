import fs from 'fs';
import { query, testConnection, initDatabase } from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const PRODUCTS_FILE = './output/productos_completos.json';

/**
 * Insert a product into the database
 */
async function insertProduct(product) {
  try {
    const sql = `
      INSERT INTO productos (sku, nombre, descripcion, precio_lista, precio_efectivo, pagina)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        nombre = VALUES(nombre),
        descripcion = VALUES(descripcion),
        precio_lista = VALUES(precio_lista),
        precio_efectivo = VALUES(precio_efectivo),
        pagina = VALUES(pagina)
    `;

    const params = [
      product.sku,
      product.nombre,
      product.descripcion || '',
      product.precio_lista,
      product.precio_efectivo,
      product.pagina
    ];

    const result = await query(sql, params);
    
    // Get the product ID (either new insert or existing)
    let productId;
    if (result.insertId) {
      productId = result.insertId;
    } else {
      // If updated, fetch the ID
      const [existingProduct] = await query('SELECT id FROM productos WHERE sku = ?', [product.sku]);
      productId = existingProduct.id;
    }

    return productId;
  } catch (error) {
    console.error(`Error inserting product ${product.sku}:`, error.message);
    throw error;
  }
}

/**
 * Insert an image for a product
 */
async function insertImage(productId, imagePath, tipo = 'principal', orden = 0) {
  try {
    const sql = `
      INSERT INTO imagenes (producto_id, ruta_imagen, tipo, orden)
      VALUES (?, ?, ?, ?)
    `;

    const params = [productId, imagePath, tipo, orden];
    const result = await query(sql, params);
    
    return result.insertId;
  } catch (error) {
    console.error(`Error inserting image for product ${productId}:`, error.message);
    throw error;
  }
}

/**
 * Delete all images for a product
 */
async function deleteProductImages(productId) {
  try {
    const sql = 'DELETE FROM imagenes WHERE producto_id = ?';
    await query(sql, [productId]);
  } catch (error) {
    console.error(`Error deleting images for product ${productId}:`, error.message);
    throw error;
  }
}

/**
 * Main function to load products from JSON and insert into MySQL
 */
async function toMySQL() {
  try {
    console.log('🚀 Starting MySQL insertion process...');
    
    // Test database connection
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Failed to connect to database. Check your .env configuration.');
    }

    // Initialize database tables
    console.log('📊 Initializing database tables...');
    await initDatabase();

    // Load products from JSON
    if (!fs.existsSync(PRODUCTS_FILE)) {
      throw new Error(`Products file not found: ${PRODUCTS_FILE}`);
    }

    const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));
    console.log(`\n📦 Loaded ${products.length} products from ${PRODUCTS_FILE}\n`);

    let insertedCount = 0;
    let updatedCount = 0;
    let imagesCount = 0;
    let errorCount = 0;

    // Process each product
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      
      try {
        console.log(`[${i + 1}/${products.length}] Processing: ${product.sku}`);

        // Check if product already exists
        const existing = await query('SELECT id FROM productos WHERE sku = ?', [product.sku]);
        const isUpdate = existing.length > 0;

        // Insert or update product
        const productId = await insertProduct(product);
        
        if (isUpdate) {
          updatedCount++;
          console.log(`   ✅ Updated product ID: ${productId}`);
          
          // Delete old images
          await deleteProductImages(productId);
        } else {
          insertedCount++;
          console.log(`   ✅ Inserted new product ID: ${productId}`);
        }

        // Insert images
        if (product.imagenes && product.imagenes.length > 0) {
          for (let j = 0; j < product.imagenes.length; j++) {
            const imagePath = product.imagenes[j];
            const tipo = j === 0 ? 'principal' : 'accesorio';
            
            await insertImage(productId, imagePath, tipo, j);
            imagesCount++;
          }
          console.log(`   🖼️  Inserted ${product.imagenes.length} images`);
        }

      } catch (error) {
        errorCount++;
        console.error(`   ❌ Error processing ${product.sku}: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 INSERTION SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ New products inserted: ${insertedCount}`);
    console.log(`🔄 Products updated: ${updatedCount}`);
    console.log(`🖼️  Images inserted: ${imagesCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log('='.repeat(50));

    return {
      success: true,
      inserted: insertedCount,
      updated: updatedCount,
      images: imagesCount,
      errors: errorCount
    };

  } catch (error) {
    console.error('\n❌ Error in MySQL insertion:', error.message);
    throw error;
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  toMySQL()
    .then(result => {
      console.log('\n🎉 MySQL insertion completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 MySQL insertion failed');
      process.exit(1);
    });
}

export default toMySQL;
