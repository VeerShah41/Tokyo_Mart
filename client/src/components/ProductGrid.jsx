import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { apiFetch } from '../lib/api';

export default function ProductGrid() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const fetchProducts = useCallback(async () => {
    try {
      const [productData, categoryData] = await Promise.all([
        apiFetch('/api/products'),
        apiFetch('/api/products/categories'),
      ]);
      const nextProducts = Array.isArray(productData) ? productData : productData.products || [];
      const nextCategories = Array.isArray(categoryData?.categories) ? categoryData.categories.filter(Boolean) : [];
      setProducts(nextProducts);
      setCategories(['All', ...nextCategories]);
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400); // 400ms debounce
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCat = activeCat === 'All' || p.category === activeCat;
      const lowerSearch = debouncedSearch.toLowerCase();
      const matchesSearch = p.name.toLowerCase().includes(lowerSearch) || 
                            p.brand.toLowerCase().includes(lowerSearch);
      return matchesCat && matchesSearch;
    });
  }, [products, activeCat, debouncedSearch]);

  return (
    <div>
      {/* Search and Filters */}
      <div className="filters-bar" style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '10px' }}>
        <div className="filter-search" style={{ border: '2px solid var(--border)', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px', background: 'white', transition: 'all 0.2s', boxShadow: 'var(--shadow-sm)' }}
             onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-20)'; }}
             onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
        >
          <Search size={22} color="var(--accent)" />
          <input
            autoFocus
            type="text"
            placeholder="Search products, brands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', color: 'var(--text-1)', fontSize: '1.05rem', fontWeight: '500' }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '10px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {categories.map(cat => (
            <button
              key={cat}
              className={`filter-chip ${activeCat === cat ? 'active' : ''}`}
              onClick={() => setActiveCat(cat)}
              style={{
                padding: '10px 22px',
                borderRadius: '30px',
                border: `2px solid ${activeCat === cat ? 'var(--accent)' : 'transparent'}`,
                background: activeCat === cat ? 'var(--accent)' : 'white',
                color: activeCat === cat ? '#fff' : 'var(--text-2)',
                fontWeight: activeCat === cat ? '600' : '500',
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'all 0.25s',
                whiteSpace: 'nowrap',
                boxShadow: activeCat === cat ? '0 4px 12px var(--accent-20)' : 'var(--shadow-sm)'
              }}
              onMouseOver={(e) => { if (activeCat !== cat) e.currentTarget.style.background = 'var(--bg-hover)'; }}
              onMouseOut={(e) => { if (activeCat !== cat) e.currentTarget.style.background = 'white'; }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', marginTop: '30px' }}>
        <h2 className="section-title" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{activeCat === 'All' ? 'Latest Arrivals' : activeCat}</h2>
        <span className="section-count" style={{ color: 'var(--text-3)' }}>{filteredProducts.length} items</span>
      </div>

      {loading ? (
        <div className="loading-state" style={{ textAlign: 'center', padding: '50px' }}><div className="spinner" /></div>
      ) : filteredProducts.length === 0 ? (
        <div className="empty-state" style={{ textAlign: 'center', padding: '50px', color: 'var(--text-3)' }}>No products found matching your criteria.</div>
      ) : (
        <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
          {filteredProducts.map(product => (
            <div 
              key={product.id} 
              className="product-card" 
              onClick={() => navigate(`/product/${product.id}`)}
              style={{ padding: '15px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column' }}
              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div className="product-card-img-wrap" style={{ width: '100%', aspectRatio: '1', background: 'var(--bg-deep)', borderRadius: '8px', marginBottom: '15px', overflow: 'hidden' }}>
                <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div className="product-brand" style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '5px' }}>{product.brand}</div>
              <div className="product-name" style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '10px', height: '40px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {product.name}
              </div>
              <div className="product-price-row" style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="product-price" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Rs. {product.price}</span>
                <button 
                  className="btn btn-primary" 
                  style={{ padding: '8px 12px', fontSize: '0.85rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(product, product.sizes?.[0] || 'one-size');
                  }}
                >
                  <ShoppingBag size={14} /> Add
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
