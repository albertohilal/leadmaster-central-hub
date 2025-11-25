import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración
const PRODUCTOS_JSON = path.join(__dirname, '../output/productos_texto.json');
const OUTPUT_DIR = path.join(__dirname, '../output/imagenes_web/originales');
const METADATA_FILE = path.join(__dirname, '../output/imagenes_web/metadata.json');
const BASE_URL = 'https://www.rosamonkey.com';

// Crear directorios si no existen
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`📁 Created directory: ${OUTPUT_DIR}`);
}

// Función para descargar imagen
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(filepath);
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve(true);
        });
        fileStream.on('error', (err) => {
          fs.unlinkSync(filepath);
          reject(err);
        });
      } else if (response.statusCode === 302 || response.statusCode === 301) {
        // Seguir redirecciones
        const redirectUrl = response.headers.location;
        resolve(downloadImage(redirectUrl, filepath));
      } else {
        reject(new Error(`Failed to download: ${response.statusCode}`));
      }
    }).on('error', reject);
  });
}

// Cargar todos los productos del sitio web (sin paginación, límite máximo)
async function loadAllProducts() {
  console.log('📥 Loading all products from website...');
  
  return new Promise((resolve, reject) => {
    // Shopify permite hasta 250 productos por request
    const productsUrl = `${BASE_URL}/products.json?limit=250`;
    
    https.get(productsUrl, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          const json = JSON.parse(data);
          const products = json.products || [];
          console.log(`✅ Loaded ${products.length} products from website\n`);
          resolve(products);
        } catch (error) {
          console.log(`❌ Error parsing JSON: ${error.message}`);
          console.log(`   Response preview: ${data.substring(0, 200)}`);
          resolve([]);
        }
      });
    }).on('error', (error) => {
      console.log(`❌ Network error: ${error.message}`);
      resolve([]);
    });
  });
}

// Función para buscar producto por SKU en la lista cargada
function searchProductBySKU(sku, allProducts) {
  // Limpiar SKU (remover "Lista" si existe)
  const cleanSku = sku.replace(/Lista$/i, '').trim();
  
  // Buscar por SKU exacto o similar en variants
  const product = allProducts.find(p => {
    if (p.variants) {
      return p.variants.some(v => {
        if (!v.sku) return false;
        const variantSku = v.sku.trim();
        // Match exacto o el SKU del catálogo contiene el SKU del sitio
        return variantSku === cleanSku || 
               variantSku === sku ||
               cleanSku.includes(variantSku) ||
               variantSku.includes(cleanSku);
      });
    }
    return false;
  });
  
  if (product && product.images && product.images.length > 0) {
    return product.images[0].src;
  }
  
  return null;
}

// Función para limpiar nombre de archivo
function sanitizeFilename(sku) {
  return sku.replace(/[^a-z0-9\-_]/gi, '_');
}

// Función principal
async function main() {
  console.log('🚀 Starting web image download from rosamonkey.com...\n');
  
  // Leer productos del JSON
  if (!fs.existsSync(PRODUCTOS_JSON)) {
    console.error('❌ Error: productos_texto.json not found!');
    console.log('   Please run: npm run parse:text first\n');
    return;
  }
  
  const productos = JSON.parse(fs.readFileSync(PRODUCTOS_JSON, 'utf-8'));
  console.log(`📦 Found ${productos.length} products in catalog\n`);
  
  // Cargar TODOS los productos del sitio web
  const allWebProducts = await loadAllProducts();
  
  // Crear un índice de SKUs para debug
  console.log('\n📋 Sample SKUs from website:');
  allWebProducts.slice(0, 10).forEach(p => {
    if (p.variants && p.variants[0] && p.variants[0].sku) {
      console.log(`   - ${p.variants[0].sku} (${p.title})`);
    }
  });
  console.log('');
  
  // Cargar metadata existente si existe
  let metadata = [];
  if (fs.existsSync(METADATA_FILE)) {
    metadata = JSON.parse(fs.readFileSync(METADATA_FILE, 'utf-8'));
    console.log(`📄 Loaded existing metadata: ${metadata.length} entries\n`);
  }
  
  // Obtener SKUs ya procesados
  const processedSkus = new Set(metadata.map(m => m.sku));
  
  let downloaded = 0;
  let notFound = 0;
  let errors = 0;
  let skipped = 0;

  for (let i = 0; i < productos.length; i++) {
    const producto = productos[i];
    const sku = producto.sku;
    const progress = `[${i + 1}/${productos.length}]`;
    
    // Saltar si ya fue procesado
    if (processedSkus.has(sku)) {
      console.log(`${progress} ⏩ Skipping (already processed): ${sku}`);
      skipped++;
      continue;
    }
    
    console.log(`${progress} Searching: ${sku}`);
    
    try {
      // Buscar imagen en la lista precargada
      const imageUrl = searchProductBySKU(sku, allWebProducts);
      
      if (imageUrl) {
        const filename = `${sanitizeFilename(sku)}.${imageUrl.split('.').pop().split('?')[0]}`;
        const filepath = path.join(OUTPUT_DIR, filename);
        
        // Descargar imagen
        await downloadImage(imageUrl, filepath);
        
        console.log(`   ✅ Downloaded: ${filename}`);
        
        metadata.push({
          sku,
          nombre: producto.nombre,
          imagen_web: filename,
          url_original: imageUrl,
          fecha_descarga: new Date().toISOString()
        });
        
        downloaded++;
      } else {
        console.log(`   ⏭️  Not found on website`);
        notFound++;
        
        metadata.push({
          sku,
          nombre: producto.nombre,
          imagen_web: null,
          url_original: null,
          error: 'Not found on website'
        });
      }
      
      // Pausa breve para no sobrecargar el servidor
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      errors++;
      
      metadata.push({
        sku,
        nombre: producto.nombre,
        imagen_web: null,
        url_original: null,
        error: error.message
      });
    }
    
    // Guardar metadata cada 10 productos
    if ((i + 1) % 10 === 0) {
      fs.writeFileSync(METADATA_FILE, JSON.stringify(metadata, null, 2));
      console.log(`   💾 Progress saved (${metadata.length} entries)`);
    }
  }  // Guardar metadata
  fs.writeFileSync(METADATA_FILE, JSON.stringify(metadata, null, 2));
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 DOWNLOAD SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Downloaded: ${downloaded}`);
  console.log(`⏩ Skipped (already processed): ${skipped}`);
  console.log(`⏭️  Not found: ${notFound}`);
  console.log(`❌ Errors: ${errors}`);
  console.log(`📁 Total products: ${productos.length}`);
  console.log('='.repeat(50));
  console.log(`\n📄 Metadata saved: ${METADATA_FILE}`);
  console.log(`\n🎉 Download process completed!\n`);
}

main().catch(console.error);
