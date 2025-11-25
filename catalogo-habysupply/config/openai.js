import OpenAI from 'openai';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

/**
 * OpenAI Client Configuration
 */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Analyze a product block image using GPT-4 Vision
 * @param {string} imagePath - Path to the block image
 * @param {string} textContext - Text extracted from the PDF page
 * @returns {Object} Analyzed product data with SKU, name, and image count
 */
export async function analyzeBlock(imagePath, textContext = '') {
  try {
    // Read image and convert to base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const imageUrl = `data:image/png;base64,${base64Image}`;

    const prompt = `
Analyze this product catalog block image and extract the following information:

1. **SKU**: Product code (format like "PEN-002", "ABC-123", etc.)
2. **Product Name**: The main product title
3. **Number of Product Images**: Count how many distinct product images are visible in this block (excluding text and background)
4. **Product Type**: Brief description of what the product is

${textContext ? `\nContext from PDF text:\n${textContext}` : ''}

Return ONLY a JSON object with this exact structure (no markdown, no code blocks):
{
  "sku": "detected SKU or null",
  "nombre": "product name",
  "num_imagenes": number,
  "tipo_producto": "brief description"
}
`;

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
      max_tokens: 500,
      temperature: 0.1
    });

    const content = response.choices[0].message.content.trim();
    
    // Remove markdown code blocks if present
    const jsonContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    const result = JSON.parse(jsonContent);
    
    console.log(`✅ Analyzed block: ${imagePath}`);
    console.log(`   SKU: ${result.sku}, Name: ${result.nombre}, Images: ${result.num_imagenes}`);
    
    return result;
  } catch (error) {
    console.error(`❌ Error analyzing block ${imagePath}:`, error.message);
    return {
      sku: null,
      nombre: 'Error analyzing',
      num_imagenes: 0,
      tipo_producto: 'unknown',
      error: error.message
    };
  }
}

/**
 * Match a block image with extracted text data
 * @param {string} imagePath - Path to block image
 * @param {Array} textProducts - Array of products extracted from text
 * @returns {Object} Best matching product with confidence
 */
export async function matchBlockToProduct(imagePath, textProducts) {
  try {
    const visionResult = await analyzeBlock(imagePath);
    
    if (!visionResult.sku) {
      return { ...visionResult, confidence: 'low', matched: false };
    }

    // Find matching product from text extraction
    const matchedProduct = textProducts.find(p => 
      p.sku && p.sku.toLowerCase() === visionResult.sku.toLowerCase()
    );

    if (matchedProduct) {
      return {
        ...visionResult,
        ...matchedProduct,
        confidence: 'high',
        matched: true
      };
    }

    return { ...visionResult, confidence: 'medium', matched: false };
  } catch (error) {
    console.error(`Error matching block to product:`, error.message);
    throw error;
  }
}

/**
 * Test OpenAI API connection
 */
export async function testOpenAI() {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 10
    });
    
    console.log('✅ OpenAI API connection successful');
    return true;
  } catch (error) {
    console.error('❌ OpenAI API connection failed:', error.message);
    return false;
  }
}

export default openai;
