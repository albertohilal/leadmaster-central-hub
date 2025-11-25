import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const INPUT_DIR = process.env.OUTPUT_PAGES_DIR || './output/pages';
const OUTPUT_DIR = process.env.OUTPUT_BLOCKS_DIR || './output/blocks';

/**
 * Detect and split page images into product blocks
 * For now, splits each page into two equal vertical halves (top/bottom)
 */
async function detectBlocks() {
  try {
    console.log('🚀 Starting block detection...');
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

    // Get all page images
    const pageFiles = fs.readdirSync(INPUT_DIR)
      .filter(file => file.endsWith('.png'))
      .sort();

    if (pageFiles.length === 0) {
      throw new Error(`No page images found in ${INPUT_DIR}`);
    }

    console.log(`📄 Found ${pageFiles.length} pages to process\n`);

    let totalBlocks = 0;

    // Process each page
    for (const pageFile of pageFiles) {
      const pagePath = path.join(INPUT_DIR, pageFile);
      const pageNumber = pageFile.match(/\d+/)?.[0] || 'unknown';
      
      console.log(`Processing: ${pageFile}`);

      // Get image dimensions
      const metadata = await sharp(pagePath).metadata();
      const { width, height } = metadata;

      // Split with overlap to avoid cutting products
      // Top block: from 0% to 55% (with 5% overlap)
      // Bottom block: from 45% to 100% (with 5% overlap)
      const topHeight = Math.floor(height * 0.55);
      const bottomStart = Math.floor(height * 0.45);
      const bottomHeight = height - bottomStart;

      // Extract top block (with overlap)
      const topOutputPath = path.join(OUTPUT_DIR, `page-${pageNumber}_top.png`);
      await sharp(pagePath)
        .extract({ left: 0, top: 0, width: width, height: topHeight })
        .toFile(topOutputPath);
      console.log(`   ✅ Created: page-${pageNumber}_top.png`);
      totalBlocks++;

      // Extract bottom block (with overlap)
      const bottomOutputPath = path.join(OUTPUT_DIR, `page-${pageNumber}_bottom.png`);
      await sharp(pagePath)
        .extract({ left: 0, top: bottomStart, width: width, height: bottomHeight })
        .toFile(bottomOutputPath);
      console.log(`   ✅ Created: page-${pageNumber}_bottom.png`);
      totalBlocks++;
    }

    console.log(`\n✅ Successfully created ${totalBlocks} blocks from ${pageFiles.length} pages`);

    return {
      success: true,
      totalPages: pageFiles.length,
      totalBlocks: totalBlocks,
      outputDir: OUTPUT_DIR
    };

  } catch (error) {
    console.error('\n❌ Error detecting blocks:', error.message);
    throw error;
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  detectBlocks()
    .then(result => {
      console.log('\n🎉 Block detection completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Block detection failed');
      process.exit(1);
    });
}

export default detectBlocks;
