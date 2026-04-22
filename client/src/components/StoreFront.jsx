import { Link } from 'react-router-dom';
import ProductGrid from './ProductGrid';

export default function StoreFront({ user }) {
  return (
    <div className="storefront-home">
      <section className="catalog-intro card-surface">
        <div>
          <span className="eyebrow">Sports Essentials</span>
          <h1>Clean sports shopping, without the clutter.</h1>
          <p>Browse footwear, apparel, and everyday gear in a lighter storefront focused on products first.</p>
        </div>

        {user ? (
          user.role === 'admin' ? (
            <Link to="/admin" className="btn btn-primary">Manage inventory</Link>
          ) : (
            <Link to="/account" className="btn btn-primary">Open account</Link>
          )
        ) : (
          <Link to="/login" className="btn btn-primary">Sign in</Link>
        )}
      </section>

      <div className="store-layout" id="catalog" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px', width: '100%' }}>
        <main className="store-main" style={{ padding: '10px 0 40px' }}>
          <ProductGrid />
        </main>
      </div>
    </div>
  );
}
