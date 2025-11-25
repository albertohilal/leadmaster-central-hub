import fs from 'fs';
import path from 'path';
import { analyzeBlock } from '../config/openai.js';
import dotenv from 'dotenv';

dotenv.config();

const BLOCKS_DIR = process.env.OUTPUT_BLOCKS_DIR || './output/blocks';
const PRODUCTOS_DIR = process.env.OUTPUT_PRODUCTOS_DIR || './output/productos';
const TEXT_PRODUCTS_FILE = './output/productos_texto.json';
const OUTPUT_FILE = './output/productos_completos.json';

/**
 * Match block images to SKUs using OpenAI Vision API
 */
async function matchImagesToSKU() {
  try {
    console.log('🚀 Starting SKU matching with OpenAI Vision...');
    console.log(`   Blocks: ${BLOCKS_DIR}`);
    console.log(`   Images: ${PRODUCTOS_DIR}`);
    console.log(`   Text data: ${TEXT_PRODUCTS_FILE}\n`);

    // Load text-extracted products
    let textProducts = [];
    if (fs.existsSync(TEXT_PRODUCTS_FILE)) {
      textProducts = JSON.parse(fs.readFileSync(TEXT_PRODUCTS_FILE, 'utf-8'));
      console.log(`📄 Loaded ${textProducts.length} products from text extraction`);
    } else {
      console.log('⚠️  No text products file found, proceeding with Vision-only analysis');
    }

    // Load image map if exists
    let imageMap = [];
    const imageMapFile = './output/image_map.json';
    if (fs.existsSync(imageMapFile)) {
      imageMap = JSON.parse(fs.readFileSync(imageMapFile, 'utf-8'));
      console.log(`🗺️  Loaded image map with ${imageMap.length} entries`);
    }

    // Get all block images
    const blockFiles = fs.readdirSync(BLOCKS_DIR)
      .filter(file => file.endsWith('.png'))
      .sort();

    if (blockFiles.length === 0) {
      throw new Error(`No block images found in ${BLOCKS_DIR}`);
    }

    console.log(`\n📦 Processing ${blockFiles.length} blocks...\n`);

    const matchedProducts = [];
    let processedCount = 0;

    // Process each block with OpenAI Vision
    for (const blockFile of blockFiles) {
      const blockPath = path.join(BLOCKS_DIR, blockFile);
      const blockName = path.parse(blockFile).name;
      
      // Extract page number and position from filename (e.g., "page-1_top")
      const pageMatch = blockName.match(/page-(\d+)_(top|bottom)/);
      const pageNumber = pageMatch ? parseInt(pageMatch[1]) : null;
      const position = pageMatch ? pageMatch[2] : null;

      console.log(`[${++processedCount}/${blockFiles.length}] Analyzing: ${blockFile}`);

      // Get text context for this page
      const pageTextProducts = textProducts.filter(p => p.pagina === pageNumber);
      const textContext = pageTextProducts.map(p => 
        `SKU: ${p.sku} - ${p.nombre}`
      ).join('\n');

      // Analyze block with OpenAI Vision
      const visionResult = await analyzeBlock(blockPath, textContext);

      // Find matching text product
      let matchedTextProduct = null;
      if (visionResult.sku) {
        matchedTextProduct = textProducts.find(p => 
          p.sku && p.sku.toLowerCase() === visionResult.sku.toLowerCase()
        );
      }

      // Find associated extracted images
      const blockImages = imageMap
        .filter(img => img.blockFile === blockFile)
        .map(img => `productos/${img.imageFile}`);

      // Build final product object
      const product = {
        sku: visionResult.sku || `UNKNOWN_${blockName}`,
        nombre: matchedTextProduct?.nombre || visionResult.nombre,
        descripcion: matchedTextProduct?.descripcion || '',
        precio_lista: matchedTextProduct?.precio_lista || null,
        precio_efectivo: matchedTextProduct?.precio_efectivo || null,
        pagina: pageNumber,
        posicion: position,
        num_imagenes: visionResult.num_imagenes,
        tipo_producto: visionResult.tipo_producto,
        imagenes: blockImages,
        block_file: blockFile,
        matched: !!matchedTextProduct,
        confidence: matchedTextProduct ? 'high' : 'medium'
      };

      matchedProducts.push(product);
      
      console.log(`   ✅ SKU: ${product.sku} | Images: ${product.imagenes.length} | Matched: ${product.matched ? 'Yes' : 'No'}\n`);
    }

    // Save complete products
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(matchedProducts, null, 2));
    console.log(`\n💾 Saved ${matchedProducts.length} products to: ${OUTPUT_FILE}`);

    // Statistics
    const matchedCount = matchedProducts.filter(p => p.matched).length;
    const withImages = matchedProducts.filter(p => p.imagenes.length > 0).length;
    
    console.log('\n📊 Statistics:');
    console.log(`   Total products: ${matchedProducts.length}`);
    console.log(`   Matched with text: ${matchedCount} (${Math.round(matchedCount/matchedProducts.length*100)}%)`);
    console.log(`   With extracted images: ${withImages} (${Math.round(withImages/matchedProducts.length*100)}%)`);

    return {
      success: true,
      totalProducts: matchedProducts.length,
      matchedProducts: matchedProducts,
      outputFile: OUTPUT_FILE
    };

  } catch (error) {
    console.error('\n❌ Error matching images to SKU:', error.message);
    throw error;
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  matchImagesToSKU()
    .then(result => {
      console.log('\n🎉 SKU matching completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 SKU matching failed');
      process.exit(1);
    });
}

export default matchImagesToSKU;
