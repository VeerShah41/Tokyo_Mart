import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
// ─── Color swatch dots ────────────────────────────────────────────────────────
const COLOR_MAP = {
  black: '#1a1a1a', white: '#f0f0f0', blue: '#3b82f6', navy: '#1e3a5f',
  red: '#ef4444', green: '#10b981', grey: '#6b7280', gray: '#6b7280',
  silver: '#c0c0c0', brown: '#92400e', purple: '#8b5cf6', maroon: '#7f1d1d',
  yellow: '#f59e0b', orange: '#f97316', pink: '#ec4899', multicolor: 'linear-gradient(135deg, red, yellow, green, blue)',
};

function ColorDot({ color }) {
  const bg = COLOR_MAP[color.toLowerCase()] || color;
  return (
    <span
      title={color}
      style={{
        display: 'inline-block',
        width: 12,
        height: 12,
        borderRadius: '50%',
        background: bg,
        border: '1.5px solid rgba(255,255,255,0.2)',
        flexShrink: 0,
      }}
    />
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
export default function ProductCard({ product, compact = false }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const stockLabel =
    product.stock <= 0 ? 'Out of stock' :
    product.stock <= 5 ? `Only ${product.stock} left` :
    `In Stock`;

  const stockClass =
    product.stock <= 0 ? 'out-stock' :
    product.stock <= 5 ? 'low-stock' : 'in-stock';

  const colors = Array.isArray(product.colors) ? product.colors : [];
  const sizes  = Array.isArray(product.sizes)  ? product.sizes  : [];

  const handleAddToCart = (e) => {
    e.stopPropagation();
    const size = sizes.length > 0 && sizes[0] !== 'one-size' ? sizes[0] : 'one-size';
    addToCart(product, size);
  };

  return (
    <div className="product-card" onClick={() => navigate(`/product/${product.slug || product.id}`)}>
      {/* Image */}
      <div className="product-card-img-wrap">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="product-card-img"
          onError={(e) => {
            e.target.src = `https://placehold.co/400x300/121220/6366f1?text=${encodeURIComponent(product.name.slice(0, 12))}`;
          }}
        />
        {product.featured && <span className="featured-badge">⭐ Featured</span>}
      </div>

      {/* Body */}
      <div className="product-card-body">
        <div className="product-brand">{product.brand}</div>
        <div className="product-name">{product.name}</div>

        {/* Colors */}
        {colors.length > 0 && (
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
            {colors.slice(0, 5).map((c) => <ColorDot key={c} color={c} />)}
          </div>
        )}

        {/* Price + Stock */}
        <div className="product-price-row">
          <div className="product-price">
            <span className="currency">₹</span>
            {product.price.toLocaleString('en-IN')}
          </div>
          <span className={`product-stock ${stockClass}`}>{stockLabel}</span>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="product-card-footer">
        <button
          className="btn btn-primary btn-sm"
          disabled={product.stock <= 0}
          onClick={handleAddToCart}
        >
          {product.stock <= 0 ? 'Sold Out' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
