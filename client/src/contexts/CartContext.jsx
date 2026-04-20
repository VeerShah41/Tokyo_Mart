import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('tm_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('tm_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = useCallback((product, size, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find(item => item.product.id === product.id && item.size === size);
      if (existing) {
        return prev.map(item => 
          (item.product.id === product.id && item.size === size)
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [...prev, { product, size, quantity: qty }];
    });
    setIsCartOpen(true);
  }, []);

  const removeFromCart = useCallback((productId, size) => {
    setCart(prev => prev.filter(item => !(item.product.id === productId && item.size === size)));
  }, []);

  const updateQuantity = useCallback((productId, size, qty) => {
    if (qty < 1) {
      removeFromCart(productId, size);
      return;
    }
    setCart(prev => prev.map(item => 
      (item.product.id === productId && item.size === size)
        ? { ...item, quantity: qty }
        : item
    ));
  }, [removeFromCart]);

  const clearCart = useCallback(() => setCart([]), []);

  const totalItems = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const totalPrice = useMemo(() => cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0), [cart]);

  const value = useMemo(() => ({
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    totalPrice,
    isCartOpen,
    setIsCartOpen
  }), [cart, addToCart, updateQuantity, removeFromCart, clearCart, totalItems, totalPrice, isCartOpen]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

