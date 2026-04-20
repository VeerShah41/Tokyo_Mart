// Cart is now managed in-memory via the AI chat session (/api/chat/cart).
// These endpoints are kept for backward compat and return empty gracefully.

const getCart      = async (req, res) => res.json({ items: [], message: 'Use /api/chat/cart/:sessionId for cart operations.' });
const addToCart    = async (req, res) => res.status(200).json({ message: 'Use /api/chat/cart/add for cart operations.' });
const updateCartItem = async (req, res) => res.status(200).json({ message: 'Use /api/chat/cart for cart operations.' });
const removeFromCart = async (req, res) => res.json({ message: 'Use /api/chat/cart/:sessionId/:productId to remove items.' });

module.exports = { getCart, addToCart, updateCartItem, removeFromCart };
