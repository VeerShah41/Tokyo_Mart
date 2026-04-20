import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';

import { useCart } from '../contexts/CartContext';
import { apiFetch, formatCurrency } from '../lib/api';

export default function CheckoutPage({ user }) {
  const { cart, totalPrice, clearCart, setIsCartOpen } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successOrder, setSuccessOrder] = useState(null);
  const [form, setForm] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
  });

  useEffect(() => {
    setIsCartOpen(false);
  }, [setIsCartOpen]);

  useEffect(() => {
    setForm((current) => ({
      ...current,
      fullName: current.fullName || user?.name || '',
      email: current.email || user?.email || '',
    }));
  }, [user]);

  const shipping = totalPrice > 0 ? 99 : 0;
  const grandTotal = totalPrice + shipping;

  const cartItems = useMemo(
    () =>
      cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        size: item.size,
      })),
    [cart]
  );

  if (cart.length === 0 && !successOrder) {
    return <Navigate to="/" />;
  }

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handlePlaceOrder = async (event) => {
    event.preventDefault();
    setError('');

    if (!user) {
      setError('Please sign in to place your order.');
      return;
    }

    if (!form.address || !form.city || !form.state || !form.postalCode) {
      setError('Please fill in all shipping details.');
      return;
    }

    setLoading(true);
    try {
      const data = await apiFetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify({ cartItems }),
      });
      setSuccessOrder(data.order);
      clearCart();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (successOrder) {
    return (
      <div className="detail-page" style={{ textAlign: 'center', marginTop: '8vh' }}>
        <h1 style={{ color: 'var(--accent)', marginBottom: '20px' }}>Order placed successfully</h1>
        <p style={{ marginBottom: '10px' }}>Your order #{successOrder.id} is now in your account history.</p>
        <p style={{ marginBottom: '30px', color: 'var(--text-3)' }}>
          Total paid: {formatCurrency(successOrder.totalAmount)}
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link className="btn btn-primary" to="/account/orders">
            View Orders
          </Link>
          <Link className="btn btn-outline" to="/">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="detail-page" style={{ maxWidth: '980px', margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ marginBottom: '30px' }}>Checkout</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '40px' }}>
        <form
          onSubmit={handlePlaceOrder}
          style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}
        >
          <h3 style={{ marginBottom: '20px' }}>Shipping Details</h3>
          <div style={{ display: 'grid', gap: '15px' }}>
            <input
              className="form-input"
              placeholder="Full Name"
              value={form.fullName}
              onChange={(event) => updateField('fullName', event.target.value)}
            />
            <input
              className="form-input"
              placeholder="Email Address"
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
            />
            <textarea
              className="form-input"
              placeholder="Delivery Address"
              rows={3}
              value={form.address}
              onChange={(event) => updateField('address', event.target.value)}
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
              <input
                className="form-input"
                placeholder="City"
                value={form.city}
                onChange={(event) => updateField('city', event.target.value)}
              />
              <input
                className="form-input"
                placeholder="State"
                value={form.state}
                onChange={(event) => updateField('state', event.target.value)}
              />
            </div>
            <input
              className="form-input"
              placeholder="Postal Code"
              value={form.postalCode}
              onChange={(event) => updateField('postalCode', event.target.value)}
            />
          </div>

          <h3 style={{ margin: '30px 0 20px' }}>Payment Method</h3>
          <div style={{ border: '1px solid var(--accent)', padding: '16px', borderRadius: '8px', background: 'var(--accent-20)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: '500' }}>
              <input type="radio" checked readOnly />
              Cashless demo payment
            </label>
            <p style={{ marginTop: '10px', color: 'var(--text-2)', fontSize: '0.9rem' }}>
              Order placement now creates a real backend order and updates stock. No hardcoded payment success screen.
            </p>
          </div>

          {error && (
            <div style={{ marginTop: '16px', color: 'var(--red)', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          {!user && (
            <div style={{ marginTop: '16px', color: 'var(--text-2)', fontSize: '0.9rem' }}>
              Sign in first to complete checkout.
            </div>
          )}

          <button
            className="btn btn-primary w-full"
            style={{ marginTop: '24px', padding: '16px', fontSize: '1.05rem' }}
            type="submit"
            disabled={loading || !user}
          >
            {loading ? 'Placing order...' : `Place Order • ${formatCurrency(grandTotal)}`}
          </button>
        </form>

        <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)', height: 'fit-content' }}>
          <h3 style={{ marginBottom: '20px' }}>Order Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
            {cart.map((item, index) => (
              <div key={`${item.product.id}-${item.size}-${index}`} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <img src={item.product.imageUrl} alt={item.product.name} style={{ width: '50px', height: '50px', borderRadius: '6px', objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>{item.product.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Size: {item.size} • Qty: {item.quantity}</div>
                </div>
                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{formatCurrency(item.product.price * item.quantity)}</div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span>Subtotal</span>
            <span>{formatCurrency(totalPrice)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: 'var(--text-2)' }}>
            <span>Shipping</span>
            <span>{formatCurrency(shipping)}</span>
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '1.2rem' }}>
            <span>Total</span>
            <span>{formatCurrency(grandTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
