import ProductGrid from './ProductGrid';

export default function StoreFront({ onAskAI }) {
  return (
    <div className="store-layout" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px', width: '100%' }}>
      <main className="store-main" style={{ padding: '30px 0' }}>
        <ProductGrid onAskAI={onAskAI} />
      </main>
    </div>
  );
}
