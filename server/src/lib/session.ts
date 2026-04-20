// ─── In-memory Session Store ──────────────────────────────────────────────────
// Keyed by sessionId (UUID generated client-side)
// In production, replace with Redis or a DB-backed session

const sessions = new Map();

const DEFAULT_CONTEXT = () => ({
  budget: null,
  category: null,
  brand: null,
  color: null,
  size: null,
  lastProducts: [],
  lastCartUpdate: null,
});

/**
 * Get (or create) a session by ID
 */
function getSession(id) {
  if (!sessions.has(id)) {
    sessions.set(id, {
      history: [],    // Gemini chat history
      cart: [],       // Cart items: [{ productId, name, price, size, quantity, imageUrl }]
      context: DEFAULT_CONTEXT(),
    });
  }
  return sessions.get(id);
}

/**
 * Clear a session's chat history and context (but keep cart)
 */
function resetSession(id) {
  const session = getSession(id);
  session.history = [];
  session.context = DEFAULT_CONTEXT();
}

/**
 * Clear a session's cart
 */
function clearCart(id) {
  const session = getSession(id);
  session.cart = [];
}

/**
 * Remove one item from cart
 */
function removeFromCart(id, productId) {
  const session = getSession(id);
  session.cart = session.cart.filter((i) => i.productId !== Number(productId));
}

module.exports = { getSession, resetSession, clearCart, removeFromCart };
