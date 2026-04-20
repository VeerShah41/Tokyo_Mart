const router = require('express').Router();
const path = require('path');
const { getModel } = require('../lib/gemini');
const { getSession, resetSession, removeFromCart } = require('../lib/session');
const { searchProducts, formatProduct } = require('../lib/product-search');
const prisma = require('../lib/prisma');

// Load static JSON data
const store = require(path.resolve(__dirname, '../../../data/store.json'));
const faqs = require(path.resolve(__dirname, '../../../data/faqs.json'));

// ─── Tool Executor ────────────────────────────────────────────────────────────
async function executeTool(name, args, session) {
  switch (name) {
    // ── search_products ──────────────────────────────────────────────────────
    case 'search_products': {
      const products = await searchProducts(args);
      session.context.lastProducts = products;
      // Update context from search args
      if (args.category) session.context.category = args.category;
      if (args.color) session.context.color = args.color;
      if (args.maxPrice) session.context.budget = args.maxPrice;
      if (args.brand) session.context.brand = args.brand;
      return {
        count: products.length,
        products: products.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          category: p.category,
          brand: p.brand,
          stock: p.stock,
          colors: p.colors,
          sizes: p.sizes,
          featured: p.featured,
        })),
      };
    }

    // ── get_product_by_id ────────────────────────────────────────────────────
    case 'get_product_by_id': {
      const product = await prisma.product.findUnique({
        where: { id: Number(args.id) },
      });
      if (!product) return { error: 'Product not found' };
      const formatted = formatProduct(product);
      session.context.lastProducts = [formatted];
      return {
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
        brand: product.brand,
        stock: product.stock,
        description: product.description,
        colors: JSON.parse(product.colors || '[]'),
        sizes: JSON.parse(product.sizes || '[]'),
        featured: product.featured,
      };
    }

    // ── compare_products ─────────────────────────────────────────────────────
    case 'compare_products': {
      const ids = (args.ids || []).map(Number);
      const products = await prisma.product.findMany({
        where: { id: { in: ids } },
      });
      const formatted = products.map((p) => formatProduct(p, 'Comparison item'));
      session.context.lastProducts = formatted;
      return {
        count: products.length,
        products: products.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          brand: p.brand,
          category: p.category,
          colors: JSON.parse(p.colors || '[]'),
          sizes: JSON.parse(p.sizes || '[]'),
          stock: p.stock,
          description: p.description,
        })),
      };
    }

    // ── get_store_policy ─────────────────────────────────────────────────────
    case 'get_store_policy': {
      const topic = (args.topic || '').toLowerCase();
      // Check FAQs first
      const faq = faqs.find((f) => f.topic.toLowerCase().includes(topic));
      if (faq) return { topic: faq.topic, answer: faq.answer };
      // Then check store.policies
      const policyKeys = Object.keys(store.policies || {});
      const matchKey = policyKeys.find((k) => k.includes(topic) || topic.includes(k));
      if (matchKey) return { topic: matchKey, answer: store.policies[matchKey] };
      return {
        topic,
        answer: `For ${topic} related queries, please contact our support team at ${store.supportEmail} or call ${store.supportPhone}. Support hours: ${store.supportHours}.`,
      };
    }

    // ── add_to_cart ──────────────────────────────────────────────────────────
    case 'add_to_cart': {
      const product = await prisma.product.findUnique({
        where: { id: Number(args.productId) },
      });
      if (!product) return { success: false, error: 'Product not found' };
      if (product.stock < 1) return { success: false, error: 'Out of stock' };

      const cart = session.cart || [];
      const cartKey = `${args.productId}-${args.size || 'one-size'}`;
      const existing = cart.find(
        (i) => i.productId === Number(args.productId) && i.size === (args.size || 'one-size')
      );

      if (existing) {
        existing.quantity += Number(args.quantity) || 1;
      } else {
        cart.push({
          productId: Number(args.productId),
          name: product.name,
          price: product.price,
          size: args.size || 'one-size',
          quantity: Number(args.quantity) || 1,
          imageUrl: product.imageUrl,
          slug: product.slug,
        });
      }

      session.cart = cart;
      const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
      session.context.lastCartUpdate = {
        action: 'add',
        item: { name: product.name, price: product.price, size: args.size || 'one-size' },
      };

      return {
        success: true,
        message: `Added ${product.name} to cart! 🛒`,
        cartCount: cart.length,
        total,
      };
    }

    // ── list_cart_items ──────────────────────────────────────────────────────
    case 'list_cart_items': {
      const cart = session.cart || [];
      const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
      return { cart, total, count: cart.length };
    }

    default:
      return { error: `Unknown tool: ${name}` };
  }
}

// ─── POST /api/chat ───────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    if (!message || !sessionId) {
      return res.status(400).json({ message: 'message and sessionId are required' });
    }

    const session = getSession(sessionId);
    // Reset per-turn state
    session.context.lastProducts = [];
    session.context.lastCartUpdate = null;

    const model = getModel();
    const chat = model.startChat({ history: session.history || [] });

    // Send the user's message
    let response = await chat.sendMessage(message);

    // ── Handle function call loop ─────────────────────────────────────────
    let iterations = 0;
    while (response.response.functionCalls()?.length > 0 && iterations < 5) {
      const calls = response.response.functionCalls();
      const responseParts = [];

      for (const call of calls) {
        let result;
        try {
          result = await executeTool(call.name, call.args, session);
        } catch (toolErr) {
          result = { error: toolErr.message };
        }
        responseParts.push({
          functionResponse: {
            name: call.name,
            response: { result: JSON.stringify(result) },
          },
        });
      }

      response = await chat.sendMessage(responseParts);
      iterations++;
    }

    // ── Save updated history ──────────────────────────────────────────────
    session.history = await chat.getHistory();
    // Trim to last 30 turns to avoid token overflow
    if (session.history.length > 60) {
      session.history = session.history.slice(-60);
    }

    const reply = response.response.text();

    return res.json({
      reply,
      intent: 'response',
      products: session.context.lastProducts,
      cartUpdate: session.context.lastCartUpdate,
      cart: session.cart || [],
    });
  } catch (err) {
    console.error('Chat error:', err);
    return res.status(500).json({
      message: 'Chat service error.',
      error: err.message,
      reply: "Sorry, I'm having trouble right now. Please try again in a moment!",
    });
  }
});

// ─── GET /api/chat/cart/:sessionId ───────────────────────────────────────────
router.get('/cart/:sessionId', (req, res) => {
  const session = getSession(req.params.sessionId);
  const cart = session.cart || [];
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  res.json({ cart, total });
});

// ─── DELETE /api/chat/cart/:sessionId/:productId ─────────────────────────────
router.delete('/cart/:sessionId/:productId', (req, res) => {
  removeFromCart(req.params.sessionId, req.params.productId);
  const session = getSession(req.params.sessionId);
  const cart = session.cart || [];
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  res.json({ cart, total });
});

// ─── POST /api/chat/cart/add ─────────────────────────────────────────────────
router.post('/cart/add', async (req, res) => {
  const { sessionId, productId, size, quantity } = req.body;
  if (!sessionId || !productId) {
    return res.status(400).json({ message: 'sessionId and productId required' });
  }
  const result = await executeTool('add_to_cart', { productId, size, quantity }, getSession(sessionId));
  res.json(result);
});

// ─── POST /api/chat/reset/:sessionId ─────────────────────────────────────────
router.post('/reset/:sessionId', (req, res) => {
  resetSession(req.params.sessionId);
  res.json({ success: true, message: 'Session reset.' });
});

module.exports = router;
