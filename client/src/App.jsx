import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { getStoredUser } from './lib/api';

import Header from './components/Header';
import StoreFront from './components/StoreFront';
import ProductDetail from './components/ProductDetail';
import { LoginPage, RegisterPage } from './components/AuthPages';
import AccountPage from './components/AccountPage';
import AdminPage from './components/AdminPage';
import CheckoutPage from './components/CheckoutPage';

// ─── Route guard for protected pages ─────────────────────────────────────────
function PrivateRoute({ user, children }) {
  return user ? children : <Navigate to="/login" replace />;
}

// ─── Route guard for admin-only pages ────────────────────────────────────────
function AdminRoute({ user, children }) {
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

// ─── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(() => getStoredUser());

  const handleLogin = (u) => setUser(u);
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tm_cart');
    setUser(null);
  };

  return (
    <BrowserRouter>
      <CartProvider>
        {/* Global Header */}
        <Header user={user} onLogout={handleLogout} />

        <Routes>
          {/* ── Public ── */}
          <Route path="/" element={<StoreFront user={user} />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/login" element={<LoginPage setUser={handleLogin} />} />
          <Route path="/register" element={<RegisterPage setUser={handleLogin} />} />

          {/* ── Protected ── */}
          <Route
            path="/checkout"
            element={
              <PrivateRoute user={user}>
                <CheckoutPage user={user} />
              </PrivateRoute>
            }
          />
          <Route
            path="/account"
            element={
              <PrivateRoute user={user}>
                <AccountPage user={user} />
              </PrivateRoute>
            }
          />
          <Route
            path="/account/:tab"
            element={
              <PrivateRoute user={user}>
                <AccountPage user={user} />
              </PrivateRoute>
            }
          />

          {/* ── Admin ── */}
          <Route
            path="/admin"
            element={
              <AdminRoute user={user}>
                <AdminPage />
              </AdminRoute>
            }
          />

          {/* ── Fallback ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}
