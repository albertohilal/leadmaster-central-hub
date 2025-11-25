import OpenAI from 'openai';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const BLOCKS_DIR = process.env.OUTPUT_BLOCKS_DIR || './output/blocks';
const OUTPUT_DIR = process.env.OUTPUT_PRODUCTOS_DIR || './output/productos';

/**
 * Detect the red border rectangle coordinates using OpenAI Vision
 */
async function detectProductBorder(imagePath) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const imageUrl = `data:image/png;base64,${base64Image}`;

    const prompt = `Analyze this product catalog page image. There is a red border rectangle containing the product image and product details.

Your task:
1. Detect the INNER area of the RED BORDER rectangle (everything INSIDE the red frame)
2. The border forms a rectangle - find its inner boundaries
3. Return the bounding box coordinates as percentages of the total image dimensions for the CONTENT AREA inside the border

Return ONLY a JSON object (no markdown, no code blocks):
{
  "has_border": true or false,
  "x_start": percentage (0-100) - left inner edge,
  "y_start": percentage (0-100) - top inner edge,
  "x_end": percentage (0-100) - right inner edge,
  "y_end": percentage (0-100) - bottom inner edge
}

Important: Return the coordinates for the ENTIRE content area inside the red border, not just the product image itself.
If there's no red border, set has_border to false.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
                detail: 'high'
              }
            }
          ]
        }
      ],
      max_tokens: 300,
      temperature: 0.1
    });

    const content = response.choices[0].message.content.trim();
    const jsonContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    return JSON.parse(jsonContent);
  } catch (error) {
    console.error(`Error detecting border in ${imagePath}:`, error.message);
    return { has_border: false };
  }
}

/**
 * Extract product image from detected border
 */
async function extractProductImage(blockPath, borderCoords, outputPath) {
  try {
    const metadata = await sharp(blockPath).metadata();
    const { width, height } = metadata;

    // Convert percentages to pixels
    let left = Math.floor((borderCoords.x_start / 100) * width);
    let top = Math.floor((borderCoords.y_start / 100) * height);
    let right = Math.floor((borderCoords.x_end / 100) * width);
    let bottom = Math.floor((borderCoords.y_end / 100) * height);

    // Add padding to ensure we capture everything inside the border
    // Add 1% padding inward (border thickness compensation)
    const paddingX = Math.floor(width * 0.01);
    const paddingY = Math.floor(height * 0.01);
    
    left = Math.max(0, left + paddingX);
    top = Math.max(0, top + paddingY);
    right = Math.min(width, right - paddingX);
    bottom = Math.min(height, bottom - paddingY);

    const extractWidth = right - left;
    const extractHeight = bottom - top;

    // Validate dimensions
    if (extractWidth <= 0 || extractHeight <= 0) {
      throw new Error('Invalid extraction dimensions');
    }

    await sharp(blockPath)
      .extract({
        left: left,
        top: top,
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
    console.log('🚀 Starting AI-powered product extraction from borders...');
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
        return pageNum >= 4; // Process only from page 4 onwards
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

      // Detect border with AI
      const borderCoords = await detectProductBorder(blockPath);

      if (borderCoords.has_border) {
        const outputFileName = `${blockName}_product.png`;
        const outputPath = path.join(OUTPUT_DIR, outputFileName);

        console.log(`   🎯 Border detected: (${borderCoords.x_start.toFixed(1)}, ${borderCoords.y_start.toFixed(1)}) to (${borderCoords.x_end.toFixed(1)}, ${borderCoords.y_end.toFixed(1)})`);

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
        console.log(`   ⏭️  No border detected, skipping\n`);
        skippedCount++;
      }

      // Add small delay to avoid rate limits
      if (i < blockFiles.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
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
