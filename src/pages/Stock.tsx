import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Page, SegmentedControl, Badge, ProductPhoto, Spinner, Empty, Icon, ICONS } from '../components/ui';
import { getProducts } from '../lib/data';
import { inr } from '../lib/format';
import { CATEGORIES, categoryLabel, type Product } from '../types';

export default function Stock() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState<string>('all');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        setProducts(await getProducts());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(
      (p) =>
        (cat === 'all' || p.category === cat) &&
        (!q || p.name.toLowerCase().includes(q) || (p.brand ?? '').toLowerCase().includes(q)),
    );
  }, [products, query, cat]);

  const totalBottles = products.reduce((n, p) => n + p.stock_qty, 0);

  return (
    <Page
      eyebrow="Inventory"
      title="Stock"
      subtitle={`${products.length} products · ${totalBottles} bottles`}
      right={
        <Link to="/products/new" className="btn primary">
          <Icon d={ICONS.plus} size={16} /> Product
        </Link>
      }
    >
      <div className="search-row">
        <span className="search-ico">
          <Icon d={ICONS.search} size={17} />
        </span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name or brand…"
          aria-label="Search products"
        />
      </div>

      <SegmentedControl<string>
        ariaLabel="Category filter"
        scroll
        value={cat}
        onChange={setCat}
        options={[{ value: 'all', label: 'All' }, ...CATEGORIES.map((c) => ({ value: c.value, label: c.label }))]}
      />

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <Empty
          illo={query || cat !== 'all' ? 'search' : 'box'}
          title={query || cat !== 'all' ? 'No matches' : 'No products yet'}
          text={
            query || cat !== 'all'
              ? 'Try a different search or category.'
              : 'Add your first product with its photo, procurement price and sell price.'
          }
          action={
            !query && cat === 'all' ? (
              <Link to="/products/new" className="btn primary">
                Add product
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="stock-grid">
          {filtered.map((p) => (
            <Link key={p.id} to={`/products/${p.id}`} className="stock-card">
              <ProductPhoto url={p.image_url} name={p.name} size={64} radius={18} />
              <div className="stock-main">
                <b>{p.name}</b>
                <span className="muted small">
                  {[p.brand, categoryLabel(p.category), p.size_ml ? `${p.size_ml} ml` : null]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
                <span className="stock-price">{inr(Number(p.sell_price))}</span>
              </div>
              <div className="stock-qty">
                <Badge tone={p.stock_qty === 0 ? 'neg' : p.stock_qty <= p.low_stock_at ? 'warn' : 'pos'}>
                  {p.stock_qty === 0 ? 'Out' : `${p.stock_qty}`}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Page>
  );
}
