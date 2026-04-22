import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { ShoppingCart, LogOut, Package, Minus, Plus, X } from 'lucide-react';
import { formatCurrency } from '../lib/api';

export default function Header({ user, onLogout }) {
  const { cart, totalItems, totalPrice, removeFromCart, updateQuantity, isCartOpen, setIsCartOpen } = useCart();
  const navigate = useNavigate();

  return (
    <>
      <header className="header">
        <div className="header-left">
          <Link to="/" className="header-logo">
            <img src="/logo.png" alt="Tokyo Mart" className="brand-logo-img" />
            <span>Tokyo Mart</span>
          </Link>
        </div>

        <div className="header-actions">
          {user?.role === 'admin' && (
            <Link to="/admin" className="user-pill" style={{ textDecoration: 'none' }}>
              <Package size={16} /> Manage Store
            </Link>
          )}

          <div className="nav-account-dropdown">
            <Link to={user ? "/account" : "/login"} className="nav-account-btn">
              <span className="nav-line-1">Hello, {user ? user.name.split(' ')[0] : 'sign in'}</span>
              <span className="nav-line-2">Account <span className="nav-arrow"></span></span>
            </Link>
            
            <div className="nav-dropdown-menu">
              {!user ? (
                <div className="nav-dropdown-sign-in">
                  <Link to="/login" className="btn btn-primary" style={{ display: 'block', textDecoration: 'none' }}>Sign in</Link>
                  <p className="nav-dropdown-new">New customer? <Link to="/register">Create your account.</Link></p>
                </div>
              ) : (
                <div className="nav-dropdown-user">
                  <h4>Your Account</h4>
                  <ul className="nav-dropdown-links">
                    <li><Link to="/account">Your Account</Link></li>
                    <li><Link to="/account/orders">Your Orders</Link></li>
                    <li><Link to="/account/settings">Account Settings</Link></li>
                  </ul>
                  <button onClick={onLogout} className="btn-logout">
                    <LogOut size={14} style={{ marginRight: '6px' }} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>

          <button className="cart-btn" onClick={() => setIsCartOpen(true)}>
            <ShoppingCart size={18} />
            <span>Cart</span>
            {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
          </button>
        </div>
      </header>

      {/* Slide-out Cart */}
      {isCartOpen && (
        <div className="cart-overlay" onClick={() => setIsCartOpen(false)}>
          <div className="cart-sidebar" onClick={e => e.stopPropagation()}>
            <div className="cart-top">
              <div>
                <h3>Your Cart</h3>
                <p className="cart-subtitle">{totalItems > 0 ? `${totalItems} item${totalItems > 1 ? 's' : ''} ready to checkout` : 'Add products to start your order'}</p>
              </div>
              <button className="cart-close-btn" onClick={() => setIsCartOpen(false)} aria-label="Close cart">
                <X size={18} />
              </button>
            </div>
            
            <div className="cart-items">
              {cart.length === 0 ? (
                <div className="cart-empty">
                  <ShoppingCart size={40} className="cart-empty-icon" />
                  <p>Your cart is empty</p>
                  <button className="btn btn-outline" onClick={() => setIsCartOpen(false)}>Continue Shopping</button>
                </div>
              ) : (
                cart.map((item, i) => (
                  <div key={i} className="cart-item">
                    <img src={item.product.imageUrl} alt={item.product.name} className="cart-item-img" />
                    <div className="cart-item-info">
                      <div className="cart-item-name">{item.product.name}</div>
                      <div className="cart-item-meta">Size: {item.size}</div>
                      <div className="cart-item-controls">
                        <div className="quantity-stepper">
                          <button
                            type="button"
                            className="quantity-btn"
                            onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                            aria-label={`Decrease quantity of ${item.product.name}`}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="quantity-value">{item.quantity}</span>
                          <button
                            type="button"
                            className="quantity-btn"
                            onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                            aria-label={`Increase quantity of ${item.product.name}`}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button
                          type="button"
                          className="cart-remove-btn"
                          onClick={() => removeFromCart(item.product.id, item.size)}
                        >
                          Remove
                        </button>
                      </div>
                      <div className="cart-item-price-row">
                        <span className="cart-item-unit">{formatCurrency(item.product.price, item.product.currency)} each</span>
                        <div className="cart-item-price">{formatCurrency(item.product.price * item.quantity, item.product.currency)}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-bottom">
                <div className="cart-summary-card">
                  <div className="cart-summary-row">
                    <span>Items</span>
                    <strong>{totalItems}</strong>
                  </div>
                  <div className="cart-summary-row">
                    <span>Estimated total</span>
                    <strong>{formatCurrency(totalPrice)}</strong>
                  </div>
                </div>
                <div className="cart-total">
                  <span className="cart-total-label">Subtotal</span>
                  <span className="cart-total-price">{formatCurrency(totalPrice)}</span>
                </div>
                <button className="btn btn-primary w-full" onClick={() => navigate('/checkout')}>
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
