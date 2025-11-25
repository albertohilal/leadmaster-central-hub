import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import dotenv from 'dotenv';

dotenv.config();

const PDF_INPUT_PATH = process.env.PDF_INPUT_PATH || './pdf/catalogo.pdf';
const OUTPUT_FILE = './output/productos_texto.json';

/**
 * Parse PDF text and extract product information
 */
async function parseText() {
  try {
    console.log('🚀 Starting PDF text parsing...');
    console.log(`   Input: ${PDF_INPUT_PATH}`);

    // Check if PDF exists
    if (!fs.existsSync(PDF_INPUT_PATH)) {
      throw new Error(`PDF file not found: ${PDF_INPUT_PATH}`);
    }

    // Read PDF file
    const dataBuffer = fs.readFileSync(PDF_INPUT_PATH);
    
    console.log('⏳ Extracting text from PDF...');
    const pdfData = await pdfParse(dataBuffer);

    console.log(`📄 Total pages: ${pdfData.numpages}`);
    console.log(`📝 Total characters: ${pdfData.text.length}\n`);

    // Split text by pages (heuristic approach)
    const fullText = pdfData.text;
    const products = [];

    // Regular expressions for extracting product data
    const skuRegex = /SKU[:\s]*([A-Z0-9\-]+)/gi;
    const priceRegex = /\$\s*(\d+[\.,]?\d*)/g;
    
    // Split by common separators and process
    const lines = fullText.split('\n').filter(line => line.trim());
    
    let currentProduct = null;
    let lineIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check for SKU
      const skuMatch = line.match(/SKU[:\s]*([A-Z0-9\-]+)/i);
      
      if (skuMatch) {
        // Save previous product if exists
        if (currentProduct && currentProduct.sku) {
          products.push(currentProduct);
        }

        // Start new product
        currentProduct = {
          sku: skuMatch[1],
          nombre: '',
          descripcion: '',
          precio_lista: null,
          precio_efectivo: null,
          pagina: Math.ceil(lineIndex / 50), // Estimate page number
          raw_text: []
        };
        
        currentProduct.raw_text.push(line);
      } else if (currentProduct) {
        currentProduct.raw_text.push(line);
        
        // Try to extract product name (usually in uppercase or first non-SKU line)
        if (!currentProduct.nombre && line.length > 3 && line.length < 100) {
          if (line === line.toUpperCase() && /[A-Z]{3,}/.test(line)) {
            currentProduct.nombre = line;
          }
        }
        
        // Extract description (concatenate remaining lines)
        if (currentProduct.nombre && !line.match(/SKU|^\$/)) {
          if (currentProduct.descripcion) {
            currentProduct.descripcion += ' ' + line;
          } else {
            currentProduct.descripcion = line;
          }
        }
        
        // Extract prices
        const prices = line.match(priceRegex);
        if (prices && prices.length > 0) {
          if (!currentProduct.precio_lista) {
            currentProduct.precio_lista = parseFloat(prices[0].replace('$', '').replace(',', '.'));
          } else if (!currentProduct.precio_efectivo && prices.length > 1) {
            currentProduct.precio_efectivo = parseFloat(prices[1].replace('$', '').replace(',', '.'));
          }
        }
      }
      
      lineIndex++;
    }

    // Add last product
    if (currentProduct && currentProduct.sku) {
      products.push(currentProduct);
    }

    // Clean up products
    products.forEach(product => {
      product.descripcion = product.descripcion.substring(0, 500).trim();
      if (!product.nombre) {
        product.nombre = `Producto ${product.sku}`;
      }
      // Remove raw_text from final output (optional)
      // delete product.raw_text;
    });

    console.log(`✅ Extracted ${products.length} products\n`);

    // Display sample products
    console.log('Sample products:');
    products.slice(0, 5).forEach((product, index) => {
      console.log(`\n${index + 1}. SKU: ${product.sku}`);
      console.log(`   Name: ${product.nombre}`);
      console.log(`   Page: ${product.pagina}`);
      console.log(`   Price: $${product.precio_lista || 'N/A'}`);
    });

    // Save to JSON file
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(products, null, 2));
    console.log(`\n💾 Saved products to: ${OUTPUT_FILE}`);

    return {
      success: true,
      totalProducts: products.length,
      products: products,
      outputFile: OUTPUT_FILE
    };

  } catch (error) {
    console.error('\n❌ Error parsing text:', error.message);
    throw error;
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  parseText()
    .then(result => {
      console.log('\n🎉 Text parsing completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Text parsing failed');
      process.exit(1);
    });
}

export default parseText;
