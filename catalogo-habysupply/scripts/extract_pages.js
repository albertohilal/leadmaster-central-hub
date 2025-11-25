import { convert } from 'pdf-poppler';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const PDF_INPUT_PATH = process.env.PDF_INPUT_PATH || './pdf/catalogo.pdf';
const OUTPUT_DIR = process.env.OUTPUT_PAGES_DIR || './output/pages';

/**
 * Extract all pages from PDF and convert them to PNG images
 */
async function extractPages() {
  try {
    console.log('🚀 Starting PDF page extraction...');
    console.log(`   Input: ${PDF_INPUT_PATH}`);
    console.log(`   Output: ${OUTPUT_DIR}`);

    // Check if PDF exists
    if (!fs.existsSync(PDF_INPUT_PATH)) {
      throw new Error(`PDF file not found: ${PDF_INPUT_PATH}`);
    }

    // Create output directory if it doesn't exist
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
      console.log(`✅ Created output directory: ${OUTPUT_DIR}`);
    }

    // Clear existing files in output directory
    const existingFiles = fs.readdirSync(OUTPUT_DIR);
    existingFiles.forEach(file => {
      fs.unlinkSync(path.join(OUTPUT_DIR, file));
    });
    console.log('🗑️  Cleared existing output files');

    // Convert PDF to images
    const options = {
      format: 'png',
      out_dir: OUTPUT_DIR,
      out_prefix: 'page',
      page: null, // Convert all pages
      scale: 2048 // High resolution for better OCR
    };

    console.log('⏳ Converting PDF pages to PNG...');
    await convert(PDF_INPUT_PATH, options);

    // Count and list generated files
    const generatedFiles = fs.readdirSync(OUTPUT_DIR)
      .filter(file => file.endsWith('.png'))
      .sort();

    console.log(`\n✅ Successfully extracted ${generatedFiles.length} pages`);
    console.log('\nGenerated files:');
    generatedFiles.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file}`);
    });

    return {
      success: true,
      totalPages: generatedFiles.length,
      files: generatedFiles,
      outputDir: OUTPUT_DIR
    };

  } catch (error) {
    console.error('\n❌ Error extracting pages:', error.message);
    throw error;
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  extractPages()
    .then(result => {
      console.log('\n🎉 Page extraction completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Page extraction failed');
      process.exit(1);
    });
}

export default extractPages;
