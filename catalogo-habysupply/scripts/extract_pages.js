import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const execAsync = promisify(exec);

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

    console.log('⏳ Converting PDF pages to PNG...');
    
    // Use pdftoppm to convert PDF to PNG
    const command = `pdftoppm -png -r 300 "${PDF_INPUT_PATH}" "${OUTPUT_DIR}/page"`;
    
    await execAsync(command);

    // Count and list generated files
    const generatedFiles = fs.readdirSync(OUTPUT_DIR)
      .filter(file => file.endsWith('.png'))
      .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || '0');
        const numB = parseInt(b.match(/\d+/)?.[0] || '0');
        return numA - numB;
      });

    console.log(`\n✅ Successfully extracted ${generatedFiles.length} pages`);
    console.log('\nGenerated files:');
    generatedFiles.slice(0, 10).forEach((file, index) => {
      console.log(`   ${index + 1}. ${file}`);
    });
    if (generatedFiles.length > 10) {
      console.log(`   ... and ${generatedFiles.length - 10} more files`);
    }

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
