import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { apiFetch, formatCurrency } from '../lib/api';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadProduct() {
      setLoading(true);
      try {
        const data = await apiFetch(`/api/products/${id}`);
        if (!isMounted) return;
        setProduct(data);
        if (data.sizes?.length) setSelectedSize(data.sizes[0]);
        if (data.colors?.length) setSelectedColor(data.colors[0]);
      } catch (err) {
        if (!isMounted) return;
        setProduct(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) return <div className="loading-state"><div className="spinner" /> Loading product...</div>;
  if (!product) return <div className="empty-state">Product not found.</div>;

  return (
    <div className="detail-page">
      <button className="detail-back" style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }} onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Back to shop
      </button>

      <div className="detail-grid">
        <div className="detail-img-wrap">
          <img src={product.imageUrl} alt={product.name} className="detail-img" />
        </div>

        <div className="detail-info">
          <div className="detail-brand">{product.brand}</div>
          <h1 className="detail-name">{product.name}</h1>
          <div className="detail-price">{formatCurrency(product.price, product.currency)}</div>
          
          <p className="detail-desc">{product.description}</p>
          
          {product.sizes?.length > 0 && product.sizes[0] !== 'one-size' && (
            <div className="detail-variants">
              <h4>Size</h4>
              <div className="variant-chips">
                {product.sizes.map(s => (
                  <button 
                    key={s} 
                    className={`variant-chip ${selectedSize === s ? 'selected' : ''}`}
                    onClick={() => setSelectedSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.colors?.length > 0 && (
            <div className="detail-variants">
              <h4>Color</h4>
              <div style={{ display: 'flex', gap: '10px' }}>
                {product.colors.map(c => (
                  <button 
                    key={c}
                    className={`color-dot ${selectedColor === c ? 'selected' : ''}`}
                    style={{ backgroundColor: c, border: `2px solid ${selectedColor === c ? 'var(--accent)' : 'var(--border)'}`, width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}
                    onClick={() => setSelectedColor(c)}
                  />
                ))}
              </div>
            </div>
          )}

          <button 
            className="btn btn-primary w-full" 
            style={{ marginTop: '30px', padding: '15px', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
            onClick={() => addToCart(product, selectedSize || 'one-size')}
            disabled={product.stock < 1}
          >
            <ShoppingBag size={20} />
            {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
}
