import sharp from 'sharp';
import Jimp from 'jimp';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const INPUT_DIR = process.env.OUTPUT_BLOCKS_DIR || './output/blocks';
const OUTPUT_DIR = process.env.OUTPUT_PRODUCTOS_DIR || './output/productos';

/**
 * Detect image regions within a block using edge detection and contour analysis
 */
async function detectImageRegions(imagePath) {
  try {
    const image = await Jimp.read(imagePath);
    const regions = [];

    // Convert to grayscale and apply threshold
    image.grayscale().contrast(0.5);

    const width = image.bitmap.width;
    const height = image.bitmap.height;

    // Simple grid-based detection (can be enhanced with actual edge detection)
    // Dividing block into potential product image regions
    const gridCols = 2;
    const gridRows = 2;
    const cellWidth = Math.floor(width / gridCols);
    const cellHeight = Math.floor(height / gridRows);

    // Scan for non-white regions
    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridCols; col++) {
        const x = col * cellWidth;
        const y = row * cellHeight;
        
        // Sample pixels to check if region contains content
        let nonWhitePixels = 0;
        let totalSamples = 0;
        
        for (let sy = y; sy < y + cellHeight && sy < height; sy += 10) {
          for (let sx = x; sx < x + cellWidth && sx < width; sx += 10) {
            const color = image.getPixelColor(sx, sy);
            const rgba = Jimp.intToRGBA(color);
            const brightness = (rgba.r + rgba.g + rgba.b) / 3;
            
            totalSamples++;
            if (brightness < 250) {
              nonWhitePixels++;
            }
          }
        }

        // If region has enough content (not mostly white)
        const contentRatio = nonWhitePixels / totalSamples;
        if (contentRatio > 0.3) {
          regions.push({
            x: x,
            y: y,
            width: Math.min(cellWidth, width - x),
            height: Math.min(cellHeight, height - y),
            contentRatio: contentRatio
          });
        }
      }
    }

    return regions;
  } catch (error) {
    console.error(`Error detecting regions in ${imagePath}:`, error.message);
    return [];
  }
}

/**
 * Extract product images from blocks
 */
async function extractImages() {
  try {
    console.log('🚀 Starting image extraction from blocks...');
    console.log(`   Input: ${INPUT_DIR}`);
    console.log(`   Output: ${OUTPUT_DIR}`);

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

    // Get all block images
    const blockFiles = fs.readdirSync(INPUT_DIR)
      .filter(file => file.endsWith('.png'))
      .sort();

    if (blockFiles.length === 0) {
      throw new Error(`No block images found in ${INPUT_DIR}`);
    }

    console.log(`📦 Found ${blockFiles.length} blocks to process\n`);

    let totalImagesExtracted = 0;
    const imageMap = [];

    // Process each block
    for (const blockFile of blockFiles) {
      const blockPath = path.join(INPUT_DIR, blockFile);
      const blockName = path.parse(blockFile).name;
      
      console.log(`Processing: ${blockFile}`);

      // Detect image regions in the block
      const regions = await detectImageRegions(blockPath);
      
      console.log(`   Found ${regions.length} potential image regions`);

      // Extract each region
      for (let i = 0; i < regions.length; i++) {
        const region = regions[i];
        const outputFileName = `${blockName}_img${i + 1}.png`;
        const outputPath = path.join(OUTPUT_DIR, outputFileName);

        try {
          await sharp(blockPath)
            .extract({
              left: region.x,
              top: region.y,
              width: region.width,
              height: region.height
            })
            .toFile(outputPath);

          console.log(`   ✅ Extracted: ${outputFileName}`);
          totalImagesExtracted++;

          imageMap.push({
            blockFile: blockFile,
            imageFile: outputFileName,
            region: region
          });
        } catch (err) {
          console.log(`   ⚠️  Failed to extract region ${i + 1}: ${err.message}`);
        }
      }
    }

    console.log(`\n✅ Successfully extracted ${totalImagesExtracted} images from ${blockFiles.length} blocks`);

    // Save image map
    const mapPath = './output/image_map.json';
    fs.writeFileSync(mapPath, JSON.stringify(imageMap, null, 2));
    console.log(`💾 Saved image map to: ${mapPath}`);

    return {
      success: true,
      totalBlocks: blockFiles.length,
      totalImages: totalImagesExtracted,
      imageMap: imageMap,
      outputDir: OUTPUT_DIR
    };

  } catch (error) {
    console.error('\n❌ Error extracting images:', error.message);
    throw error;
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  extractImages()
    .then(result => {
      console.log('\n🎉 Image extraction completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Image extraction failed');
      process.exit(1);
    });
}

export default extractImages;
