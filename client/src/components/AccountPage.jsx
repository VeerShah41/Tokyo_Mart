import { useEffect, useMemo, useState } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { User, Package, Settings, LogOut, ChevronRight } from 'lucide-react';

import { apiFetch, formatCurrency } from '../lib/api';

export default function AccountPage({ user, onLogout }) {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState('');

  useEffect(() => {
    if (!user) return;

    let isMounted = true;

    async function loadOrders() {
      setLoadingOrders(true);
      setOrdersError('');
      try {
        const data = await apiFetch('/api/orders');
        if (!isMounted) return;
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!isMounted) return;
        setOrdersError(err.message);
      } finally {
        if (isMounted) setLoadingOrders(false);
      }
    }

    loadOrders();

    return () => {
      isMounted = false;
    };
  }, [user]);

  if (!user) {
    return <Navigate to="/login" />;
  }

  const isActive = (path) => {
    if (path === '/account' && location.pathname === '/account') return true;
    if (path !== '/account' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="account-layout" style={{ display: 'flex', maxWidth: '1200px', margin: '40px auto', padding: '0 20px', gap: '30px', minHeight: '60vh' }}>
      <aside className="account-sidebar" style={{ width: '280px', flexShrink: 0 }}>
        <div className="account-user-card" style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '20px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--accent-20)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '12px' }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{user.name}</h3>
          <p style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>{user.email}</p>
        </div>

        <nav className="account-nav-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Link to="/account" className={`admin-nav-item ${isActive('/account') ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <User size={18} /> Overview
          </Link>
          <Link to="/account/orders" className={`admin-nav-item ${isActive('/account/orders') ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <Package size={18} /> Your Orders
          </Link>
          <Link to="/account/settings" className={`admin-nav-item ${isActive('/account/settings') ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <Settings size={18} /> Account Settings
          </Link>
          <div style={{ height: '1px', background: 'var(--border)', margin: '10px 0' }}></div>
          <button onClick={onLogout} className="admin-nav-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--red)', background: 'transparent' }}>
            <LogOut size={18} /> Sign Out
          </button>
        </nav>
      </aside>

      <main className="account-main" style={{ flex: 1, background: 'var(--bg-card)', padding: '30px', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
        <Routes>
          <Route index element={<OverviewTab user={user} orders={orders} loadingOrders={loadingOrders} ordersError={ordersError} />} />
          <Route path="orders" element={<OrdersTab orders={orders} loadingOrders={loadingOrders} ordersError={ordersError} />} />
          <Route path="settings" element={<SettingsTab user={user} orders={orders} />} />
        </Routes>
      </main>
    </div>
  );
}

function OverviewTab({ user, orders, loadingOrders, ordersError }) {
  const totalSpend = useMemo(
    () => orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0),
    [orders]
  );

  const latestOrder = orders[0];

  return (
    <div>
      <h2 style={{ fontSize: '1.6rem', marginBottom: '20px' }}>Welcome back, {user.name.split(' ')[0]}!</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <Link to="/account/orders" style={{ textDecoration: 'none' }}>
          <div className="stat-card" style={{ padding: '20px' }}>
            <div className="stat-card-icon" style={{ background: 'var(--accent-20)', color: 'var(--accent)' }}><Package size={24} /></div>
            <div className="stat-card-value" style={{ marginTop: '10px' }}>{orders.length}</div>
            <div className="stat-card-label" style={{ marginTop: '4px' }}>Orders placed</div>
          </div>
        </Link>
        <Link to="/account/settings" style={{ textDecoration: 'none' }}>
          <div className="stat-card" style={{ padding: '20px' }}>
            <div className="stat-card-icon" style={{ background: 'var(--accent-20)', color: 'var(--accent)' }}><Settings size={24} /></div>
            <div className="stat-card-value" style={{ marginTop: '10px' }}>{formatCurrency(totalSpend)}</div>
            <div className="stat-card-label" style={{ marginTop: '4px' }}>Total spend</div>
          </div>
        </Link>
      </div>

      <div style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
        <h3 style={{ marginBottom: '10px' }}>Recent activity</h3>
        {loadingOrders ? (
          <p style={{ color: 'var(--text-2)' }}>Loading your account activity...</p>
        ) : ordersError ? (
          <p style={{ color: 'var(--red)' }}>{ordersError}</p>
        ) : latestOrder ? (
          <>
            <p style={{ color: 'var(--text-2)', marginBottom: '8px' }}>
              Latest order: <strong>#{latestOrder.id}</strong>
            </p>
            <p style={{ color: 'var(--text-2)', marginBottom: '8px' }}>
              Status: <strong style={{ textTransform: 'capitalize' }}>{latestOrder.status}</strong>
            </p>
            <p style={{ color: 'var(--text-2)' }}>
              Total: <strong>{formatCurrency(latestOrder.totalAmount)}</strong>
            </p>
          </>
        ) : (
          <>
            <p style={{ color: 'var(--text-2)', marginBottom: '10px' }}>
              You have not placed an order yet.
            </p>
            <Link to="/" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
              Start shopping <ChevronRight size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

function OrdersTab({ orders, loadingOrders, ordersError }) {
  return (
    <div>
      <h2 style={{ fontSize: '1.6rem', marginBottom: '20px' }}>Your Orders</h2>

      {loadingOrders ? (
        <div className="loading-state"><div className="spinner" /></div>
      ) : ordersError ? (
        <div style={{ color: 'var(--red)' }}>{ordersError}</div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', border: '1px dashed var(--border)', borderRadius: '12px' }}>
          <Package size={48} color="var(--text-3)" style={{ margin: '0 auto 15px' }} />
          <h3 style={{ color: 'var(--text-1)', marginBottom: '8px' }}>No orders yet</h3>
          <p style={{ color: 'var(--text-2)', fontSize: '0.9rem' }}>Your real order history will appear here after checkout.</p>
          <Link to="/" className="btn btn-primary" style={{ display: 'inline-block', marginTop: '20px', textDecoration: 'none' }}>Continue Shopping</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {orders.map((order) => (
            <div key={order.id} style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontWeight: '700' }}>Order #{order.id}</div>
                  <div style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '700' }}>{formatCurrency(order.totalAmount)}</div>
                  <div style={{ color: 'var(--text-3)', fontSize: '0.85rem', textTransform: 'capitalize' }}>{order.status}</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {order.orderItems.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', color: 'var(--text-2)', fontSize: '0.9rem' }}>
                    <span>{item.product?.name || `Product #${item.productId}`}</span>
                    <span>Qty {item.quantity} • {formatCurrency(item.price)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SettingsTab({ user, orders }) {
  return (
    <div>
      <h2 style={{ fontSize: '1.6rem', marginBottom: '20px' }}>Account Settings</h2>
      <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>Name</div>
          <div style={{ color: 'var(--text-2)', fontSize: '0.9rem' }}>{user.name}</div>
        </div>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>Email</div>
          <div style={{ color: 'var(--text-2)', fontSize: '0.9rem' }}>{user.email}</div>
        </div>
        <div style={{ padding: '20px' }}>
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>Account Summary</div>
          <div style={{ color: 'var(--text-2)', fontSize: '0.9rem' }}>
            Role: {user.role} • Orders placed: {orders.length}
          </div>
        </div>
      </div>
    </div>
  );
}
