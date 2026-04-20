import { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Star, CheckCircle, IndianRupee, RefreshCw, Plus, Search, Settings, Edit2, Trash2 } from 'lucide-react';
import { apiFetch, formatCurrency, getStoredUser } from '../lib/api';

const EMPTY_FORM = {
  slug: '', name: '', category: '', brand: '', price: '',
  currency: 'INR', colors: '', sizes: '', stock: '',
  imageUrl: '', description: '', tags: '', featured: false,
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, value, label, color }) {
  return (
    <div className="stat-card">
      <div className="stat-card-icon" style={{ color }}>{icon}</div>
      <div className="stat-card-value" style={{ color }}>{value}</div>
      <div className="stat-card-label">{label}</div>
    </div>
  );
}

// ─── Product Form ─────────────────────────────────────────────────────────────
function ProductForm({ initial, onSave, onCancel, loading, categories }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);

  useEffect(() => { setForm(initial || EMPTY_FORM); }, [initial]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // Convert comma-separated strings to arrays
    const payload = {
      ...form,
      price:  Number(form.price),
      stock:  Number(form.stock) || 0,
      colors: form.colors ? form.colors.split(',').map((s) => s.trim()).filter(Boolean) : [],
      sizes:  form.sizes  ? form.sizes.split(',').map((s) => s.trim()).filter(Boolean)  : [],
      tags:   form.tags   ? form.tags.split(',').map((s) => s.trim()).filter(Boolean)   : [],
      featured: Boolean(form.featured),
    };
    onSave(payload);
  };

  const autoSlug = (name) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    set('slug', slug);
    set('name', name);
  };

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      <h3 style={{ fontFamily: 'var(--font-head)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
        {initial ? <><Edit2 size={20} /> Edit Product</> : <><Plus size={20} /> Add New Product</>}
      </h3>

      <div className="form-grid">
        {/* Name */}
        <div className="form-field">
          <label className="form-label">Product Name *</label>
          <input className="form-input" value={form.name} required
            onChange={(e) => autoSlug(e.target.value)}
            placeholder="e.g. Black Training Shoe" />
        </div>

        {/* Slug */}
        <div className="form-field">
          <label className="form-label">Slug (URL) *</label>
          <input className="form-input" value={form.slug} required
            onChange={(e) => set('slug', e.target.value)}
            placeholder="auto-generated-from-name" />
          <span className="form-hint">URL-friendly identifier. Auto-filled when you type the name.</span>
        </div>

        {/* Category */}
        <div className="form-field">
          <label className="form-label">Category *</label>
          <>
            <input
              className="form-input"
              list="product-categories"
              value={form.category}
              required
              onChange={(e) => set('category', e.target.value)}
              placeholder="Type or choose a category"
            />
            <datalist id="product-categories">
              {categories.map((c) => <option key={c} value={c} />)}
            </datalist>
          </>
        </div>

        {/* Brand */}
        <div className="form-field">
          <label className="form-label">Brand</label>
          <input className="form-input" value={form.brand}
            onChange={(e) => set('brand', e.target.value)}
            placeholder="e.g. Nike" />
        </div>

        {/* Price */}
        <div className="form-field">
          <label className="form-label">Price (₹) *</label>
          <input className="form-input" type="number" min="0" value={form.price} required
            onChange={(e) => set('price', e.target.value)}
            placeholder="e.g. 2499" />
        </div>

        {/* Stock */}
        <div className="form-field">
          <label className="form-label">Stock Quantity</label>
          <input className="form-input" type="number" min="0" value={form.stock}
            onChange={(e) => set('stock', e.target.value)}
            placeholder="e.g. 25" />
        </div>

        {/* Colors */}
        <div className="form-field">
          <label className="form-label">Colors</label>
          <input className="form-input" value={form.colors}
            onChange={(e) => set('colors', e.target.value)}
            placeholder="black, white, blue" />
          <span className="form-hint">Comma-separated list of colors</span>
        </div>

        {/* Sizes */}
        <div className="form-field">
          <label className="form-label">Sizes</label>
          <input className="form-input" value={form.sizes}
            onChange={(e) => set('sizes', e.target.value)}
            placeholder="S, M, L, XL  or  7, 8, 9, 10" />
          <span className="form-hint">Use "one-size" if no size applies</span>
        </div>

        {/* Image URL */}
        <div className="form-field full">
          <label className="form-label">Image URL</label>
          <input className="form-input" type="url" value={form.imageUrl}
            onChange={(e) => set('imageUrl', e.target.value)}
            placeholder="https://images.unsplash.com/…" />
          {form.imageUrl && (
            <img src={form.imageUrl} alt="Preview"
              style={{ marginTop: '0.5rem', height: '80px', width: '120px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }}
              onError={(e) => { e.target.style.display = 'none'; }} />
          )}
        </div>

        {/* Description */}
        <div className="form-field full">
          <label className="form-label">Description *</label>
          <textarea className="form-textarea" value={form.description} required
            onChange={(e) => set('description', e.target.value)}
            placeholder="Short product description for customers…" />
        </div>

        {/* Tags */}
        <div className="form-field">
          <label className="form-label">Tags</label>
          <input className="form-input" value={form.tags}
            onChange={(e) => set('tags', e.target.value)}
            placeholder="gym, training, daily wear" />
          <span className="form-hint">Comma-separated, used by AI for recommendations</span>
        </div>

        {/* Featured */}
        <div className="form-field" style={{ justifyContent: 'center' }}>
          <label className="form-label">Featured Product</label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginTop: '0.5rem' }}>
            <input type="checkbox" checked={form.featured}
              onChange={(e) => set('featured', e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: 'var(--accent)' }} />
            <span style={{ fontSize: '0.875rem', color: 'var(--text-2)' }}>Show as featured on storefront</span>
          </label>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {loading ? <><span className="spinner spinner-sm" /> Saving…</> : (initial ? <><Edit2 size={16} /> Update Product</> : <><Plus size={16} /> Add Product</>)}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

// ─── Admin Page ───────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [products,    setProducts]    = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [view,        setView]        = useState('list'); // 'list' | 'add' | 'edit'
  const [editTarget,  setEditTarget]  = useState(null);
  const [toast,       setToast]       = useState('');
  const [search,      setSearch]      = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const adminUser = getStoredUser();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  const showToast = useCallback((msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const [productData, categoryData] = await Promise.all([
        apiFetch('/api/products?limit=100'),
        apiFetch('/api/products/categories'),
      ]);
      setProducts(Array.isArray(productData) ? productData : productData.products || []);
      setCategories(Array.isArray(categoryData?.categories) ? categoryData.categories.filter(Boolean) : []);
    } catch { showToast('❌ Failed to load products'); }
    finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleSave = useCallback(async (payload) => {
    setSaving(true);
    try {
      const url    = editTarget ? `/api/products/${editTarget.id}` : `/api/products`;
      const method = editTarget ? 'PUT' : 'POST';
      await apiFetch(url, {
        method,
        body: JSON.stringify(payload),
      });
      showToast(editTarget ? '✅ Product updated!' : '✅ Product added!');
      setView('list');
      setEditTarget(null);
      fetchProducts();
    } catch (err) {
      showToast(`❌ ${err.message}`);
    } finally {
      setSaving(false);
    }
  }, [editTarget, fetchProducts, showToast]);

  const handleDelete = useCallback(async (product) => {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    try {
      await apiFetch(`/api/products/${product.id}`, { method: 'DELETE' });
      showToast('🗑️ Product deleted');
      fetchProducts();
    } catch (err) {
      showToast(`❌ ${err.message}`);
    }
  }, [fetchProducts, showToast]);

  const startEdit = useCallback((product) => {
    setEditTarget(product);
    const initialForm = {
      ...product,
      colors: Array.isArray(product.colors) ? product.colors.join(', ') : product.colors,
      sizes:  Array.isArray(product.sizes)  ? product.sizes.join(', ')  : product.sizes,
      tags:   Array.isArray(product.tags)   ? product.tags.join(', ')   : product.tags,
    };
    setEditTarget(initialForm);
    setView('edit');
  }, []);

  const filtered = useMemo(() => products.filter((p) =>
    !debouncedSearch || p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    p.brand.toLowerCase().includes(debouncedSearch.toLowerCase())
  ), [products, debouncedSearch]);

  const totalValue = useMemo(() => products.reduce((s, p) => s + p.price * p.stock, 0), [products]);
  const featuredCount = useMemo(() => products.filter((p) => p.featured).length, [products]);

  return (
    <div className="admin-layout">
      {/* ── Sidebar ── */}
      <aside className="admin-sidebar">
        <div style={{ padding: '0.5rem 0', marginBottom: '1rem' }}>
          <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.9rem', padding: '0 0.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Settings size={16} /> Admin Panel
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', padding: '0 0.5rem' }}>
            {adminUser?.email || 'Admin session'}
          </div>
        </div>

        <button className={`admin-nav-item ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Box size={16} /> Products
        </button>
        <button className={`admin-nav-item ${view === 'add' ? 'active' : ''}`} onClick={() => { setView('add'); setEditTarget(null); }} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={16} /> Add Product
        </button>
        <button className="admin-nav-item" onClick={fetchProducts} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RefreshCw size={16} /> Refresh
        </button>
      </aside>

      {/* ── Main Content ── */}
      <main className="admin-content">
        {/* Stats */}
        {view === 'list' && (
          <div className="admin-stats">
            <StatCard icon={<Box size={24} />} value={products.length} label="Total Products" color="var(--accent-hover)" />
            <StatCard icon={<Star size={24} />} value={featuredCount} label="Featured" color="var(--amber)" />
            <StatCard icon={<CheckCircle size={24} />} value={products.filter(p => p.stock > 0).length} label="In Stock" color="var(--green)" />
            <StatCard icon={<IndianRupee size={24} />} value={`${(totalValue / 1000).toFixed(0)}K`} label="Inventory Value" color="var(--text-1)" />
          </div>
        )}

        {/* ── List View ── */}
        {view === 'list' && (
          <>
            <div className="admin-header">
              <h2 style={{ fontFamily: 'var(--font-head)' }}>Product Catalog</h2>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div className="filter-search" style={{ minWidth: 220, display: 'flex', alignItems: 'center', gap: '8px', padding: '0 10px' }}>
                  <Search size={16} color="var(--text-3)" />
                  <input
                    type="text"
                    placeholder="Search products…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <button className="btn btn-primary" onClick={() => { setView('add'); setEditTarget(null); }} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Plus size={16} /> Add Product
                </button>
              </div>
            </div>

            {loading ? (
              <div className="loading-state"><div className="spinner" /></div>
            ) : (
              <div className="product-table-wrap">
                <table className="product-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Featured</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <img src={p.imageUrl} alt={p.name} className="table-img"
                              onError={(e) => { e.target.style.background = 'var(--bg-hover)'; e.target.removeAttribute('src'); }} />
                            <div>
                              <div className="table-name">{p.name}</div>
                              <div className="table-sub">{p.brand} · {p.slug}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className="product-brand">{p.category}</span></td>
                        <td style={{ fontFamily: 'var(--font-head)', fontWeight: 700 }}>
                          {formatCurrency(p.price, p.currency)}
                        </td>
                        <td>
                          <span className={`product-stock ${p.stock <= 0 ? 'out-stock' : p.stock <= 5 ? 'low-stock' : 'in-stock'}`}>
                            {p.stock}
                          </span>
                        </td>
                        <td>{p.featured ? <span style={{ color: 'var(--amber)', display: 'flex', alignItems: 'center', gap: '4px' }}><Star size={14} /> Yes</span> : <span style={{ color: 'var(--text-3)' }}>—</span>}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button className="btn btn-sm btn-outline" onClick={() => startEdit(p)}>Edit</button>
                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filtered.length === 0 && (
                  <div className="empty-state" style={{ padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--text-3)' }}>
                    <Box size={48} opacity={0.3} />
                    <p>No products match your search</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ── Add / Edit Form ── */}
        {(view === 'add' || view === 'edit') && (
          <ProductForm
            initial={view === 'edit' ? editTarget : null}
            onSave={handleSave}
            onCancel={() => { setView('list'); setEditTarget(null); }}
            loading={saving}
            categories={categories}
          />
        )}

        {/* Toast */}
        {toast && (
          <div className="toast success" style={{ right: '2rem', bottom: '2rem' }}>
            {toast}
          </div>
        )}
      </main>
    </div>
  );
}
