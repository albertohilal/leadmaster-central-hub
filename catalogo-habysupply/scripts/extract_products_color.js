import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const BLOCKS_DIR = process.env.OUTPUT_BLOCKS_DIR || './output/blocks';
const OUTPUT_DIR = process.env.OUTPUT_PRODUCTOS_DIR || './output/productos';

/**
 * Detect red border rectangle using pixel analysis
 */
async function detectRedBorder(imagePath) {
  try {
    const image = sharp(imagePath);
    const metadata = await image.metadata();
    const { width, height } = metadata;
    
    // Get raw pixel data
    const { data } = await image
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Find red pixels (R > 200, G < 100, B < 100)
    let minX = width, maxX = 0, minY = height, maxY = 0;
    let redPixelsFound = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 3;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        // Detect red color (strong red, weak green/blue)
        if (r > 180 && g < 100 && b < 100) {
          redPixelsFound++;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    // Check if we found enough red pixels to form a border
    if (redPixelsFound < 100) {
      return { has_border: false };
    }

    // Add 5px margin outside the border (expand the selection)
    const margin = 5;

    return {
      has_border: true,
      x_start: Math.max(0, minX - margin),
      y_start: Math.max(0, minY - margin),
      x_end: Math.min(width, maxX + margin),
      y_end: Math.min(height, maxY + margin),
      width: width,
      height: height
    };
  } catch (error) {
    console.error(`Error detecting border:`, error.message);
    return { has_border: false };
  }
}

/**
 * Extract product image from detected border
 */
async function extractProductImage(blockPath, borderCoords, outputPath) {
  try {
    const extractWidth = borderCoords.x_end - borderCoords.x_start;
    const extractHeight = borderCoords.y_end - borderCoords.y_start;

    if (extractWidth <= 0 || extractHeight <= 0) {
      throw new Error('Invalid extraction dimensions');
    }

    await sharp(blockPath)
      .extract({
        left: borderCoords.x_start,
        top: borderCoords.y_start,
        width: extractWidth,
        height: extractHeight
      })
      .toFile(outputPath);

    return true;
  } catch (error) {
    console.error(`Error extracting image:`, error.message);
    return false;
  }
}

/**
 * Process all blocks and extract product images from red borders
 */
async function extractProductsFromBorders() {
  try {
    console.log('🚀 Starting product extraction using red border detection...');
    console.log(`   Input: ${BLOCKS_DIR}`);
    console.log(`   Output: ${OUTPUT_DIR}`);

    // Create output directory
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Clear existing files
    const existingFiles = fs.readdirSync(OUTPUT_DIR);
    existingFiles.forEach(file => {
      fs.unlinkSync(path.join(OUTPUT_DIR, file));
    });
    console.log('🗑️  Cleared existing output files\n');

    // Get all block files (starting from page 4)
    const blockFiles = fs.readdirSync(BLOCKS_DIR)
      .filter(file => {
        if (!file.endsWith('.png')) return false;
        const pageNum = parseInt(file.match(/page-(\d+)/)?.[1] || '0');
        return pageNum >= 4;
      })
      .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || '0');
        const numB = parseInt(b.match(/\d+/)?.[0] || '0');
        return numA - numB;
      });

    console.log(`📦 Processing ${blockFiles.length} blocks...\n`);

    let extractedCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < blockFiles.length; i++) {
      const blockFile = blockFiles[i];
      const blockPath = path.join(BLOCKS_DIR, blockFile);
      const blockName = path.parse(blockFile).name;

      console.log(`[${i + 1}/${blockFiles.length}] Analyzing: ${blockFile}`);

      // Detect border with color detection
      const borderCoords = await detectRedBorder(blockPath);

      if (borderCoords.has_border) {
        const outputFileName = `${blockName}_product.png`;
        const outputPath = path.join(OUTPUT_DIR, outputFileName);

        console.log(`   🎯 Red border detected: (${borderCoords.x_start}, ${borderCoords.y_start}) to (${borderCoords.x_end}, ${borderCoords.y_end})`);

        // Extract product image
        const success = await extractProductImage(blockPath, borderCoords, outputPath);

        if (success) {
          console.log(`   ✅ Extracted: ${outputFileName}\n`);
          extractedCount++;
        } else {
          console.log(`   ⚠️  Failed to extract\n`);
          skippedCount++;
        }
      } else {
        console.log(`   ⏭️  No red border detected, skipping\n`);
        skippedCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 EXTRACTION SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Products extracted: ${extractedCount}`);
    console.log(`⏭️  Skipped: ${skippedCount}`);
    console.log(`📁 Total blocks processed: ${blockFiles.length}`);
    console.log('='.repeat(50));

    return {
      success: true,
      extracted: extractedCount,
      skipped: skippedCount,
      total: blockFiles.length
    };

  } catch (error) {
    console.error('\n❌ Error extracting products:', error.message);
    throw error;
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  extractProductsFromBorders()
    .then(result => {
      console.log('\n🎉 Product extraction completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Product extraction failed');
      process.exit(1);
    });
}

export default extractProductsFromBorders;
