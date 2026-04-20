require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─── System Prompt ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are an AI sales assistant for Shoppai AI test store.

YOUR RESPONSIBILITY: Act exactly like the chatbot seen in the demo video.

PERSONALITY & TONE:
- Be incredibly helpful, concise, and direct.
- Never sound like a robot. Speak like an expert retail associate.
- Provide a brief description of the product when showing it, highlighting key features and current price.
- Ask friendly follow-up questions to keep the conversation going, like "Would you like to explore this option further or look for more details on the pricing or availability?"

STRICT RULES:
- ALWAYS call search_products before recommending any product. Show actual items that exist in our catalog.
- If the user asks to add an item to their cart, IMMEDIATELY call the add_to_cart tool and then respond with "The [Product Name] has been added to your cart successfully. Would you like to proceed to checkout, or is there anything else you'd like to explore?"
- Give a brief description of the item in your response when showing a product.
- If a user just says "Give me a backpack", show an option and ask for feedback.
- Do NOT invent products, prices, stock, or policy details.
- Provide clear answers about shipping policies or other FAQs when asked.

AVAILABLE CATEGORIES: Footwear, Apparel, Equipment, Accessories
AVAILABLE BRANDS: Nike, Adidas, Under Armour, Puma, Reebok, Asics, Wilson, Yonex, Spalding, Everlast, Converse, Herschel`;

// ─── Tool Declarations ────────────────────────────────────────────────────────
const TOOL_DECLARATIONS = [
  {
    name: 'search_products',
    description: 'Search for products in the Tokyo Mart catalog using filters. Always call this before recommending any product.',
    parameters: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Product category: Footwear, Apparel, Equipment, Accessories',
        },
        brand: { type: 'string', description: 'Brand name filter like Nike, Adidas, Under Armour, etc.' },
        color: { type: 'string', description: 'Color preference (e.g. black, white, blue)' },
        maxPrice: { type: 'number', description: 'Maximum price in INR' },
        minPrice: { type: 'number', description: 'Minimum price in INR' },
        size: { type: 'string', description: 'Size preference' },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Use-case tags like running, basketball, gym, outdoors',
        },
        featured: { type: 'boolean', description: 'Show only featured/popular products' },
      },
    },
  },
  {
    name: 'add_to_cart',
    description: 'Add a specific product to the customer shopping cart. Use this when a user asks you to add an item you just showed them to their cart.',
    parameters: {
      type: 'object',
      properties: {
        productId: { type: 'number', description: 'The exact product ID of the item to add' },
      },
      required: ['productId'],
    },
  },
  {
    name: 'get_product_by_id',
    description: 'Get full details of a specific product by its ID',
    parameters: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Product ID (integer)' },
      },
      required: ['id'],
    },
  },
  {
    name: 'compare_products',
    description: 'Compare multiple products side by side using their IDs',
    parameters: {
      type: 'object',
      properties: {
        ids: {
          type: 'array',
          items: { type: 'number' },
          description: 'Array of product IDs to compare',
        },
      },
      required: ['ids'],
    },
  },
  {
    name: 'get_store_policy',
    description: 'Get store policy or FAQ answer for topics like shipping, returns, exchange, warranty, payment, tracking, cancellation',
    parameters: {
      type: 'object',
      properties: {
        topic: {
          type: 'string',
          description: 'Policy topic: shipping, returns, exchange, warranty, payment, tracking, cancellation, cod',
        },
      },
      required: ['topic'],
    },
  },
  {
    name: 'list_cart_items',
    description: 'Show all items currently in the shopping cart with total',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
];

// ─── Model Factory ────────────────────────────────────────────────────────────
function getModel() {
  return genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: SYSTEM_PROMPT,
    tools: [{ functionDeclarations: TOOL_DECLARATIONS }],
    generationConfig: {
      temperature: 0.8,
      maxOutputTokens: 600,
    },
  });
}

module.exports = { getModel };
