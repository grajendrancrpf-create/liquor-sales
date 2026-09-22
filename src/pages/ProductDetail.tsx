import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Page, Card, SectionHead, Badge, ProductPhoto, Spinner, Empty, Icon, ICONS } from '../components/ui';
import { getProduct, getSales, deleteProduct, adjustStock } from '../lib/data';
import { inr, fmtDate } from '../lib/format';
import { saleRevenue, categoryLabel, type Product, type Sale } from '../types';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  const refresh = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [p, s] = await Promise.all([getProduct(id), getSales()]);
      setProduct(p);
      setSales(s.filter((x) => x.product_id === id).slice(0, 10));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onDelete = async () => {
    if (!id) return;
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 4000);
      return;
    }
    await deleteProduct(id);
    navigate('/stock', { replace: true });
  };

  const bump = async (delta: number) => {
    if (!id) return;
    const updated = await adjustStock(id, delta);
    setProduct(updated);
  };

  if (loading) {
    return (
      <Page title="Product">
        <Spinner />
      </Page>
    );
  }

  if (!product) {
    return (
      <Page title="Product">
        <Empty illo="search" title="Not found" text="This product may have been deleted." action={<Link to="/stock" className="btn primary">Back to stock</Link>} />
      </Page>
    );
  }

  const soldQty = sales.reduce((n, s) => n + s.qty, 0);
  const soldRevenue = sales.reduce((n, s) => n + saleRevenue(s), 0);

  return (
    <Page
      eyebrow={categoryLabel(product.category)}
      title={product.name}
      subtitle={[product.brand, product.size_ml ? `${product.size_ml} ml` : null, product.abv ? `${product.abv}% ABV` : null].filter(Boolean).join(' · ')}
      right={
        <Link to={`/products/${product.id}/edit`} className="btn">
          <Icon d={ICONS.pencil} size={15} /> Edit
        </Link>
      }
    >
      <Card>
        <div className="detail-hero">
          <ProductPhoto url={product.image_url} name={product.name} size={96} radius={24} />
          <div>
            <div className="detail-price">{inr(Number(product.sell_price))}</div>
            <div className="muted small">Sell price</div>
            <div style={{ marginTop: 8 }}>
              <Badge tone={product.stock_qty === 0 ? 'neg' : product.stock_qty <= product.low_stock_at ? 'warn' : 'pos'}>
                {product.stock_qty === 0 ? 'Out of stock' : `${product.stock_qty} in stock`}
              </Badge>
            </div>
          </div>
        </div>
        {product.notes && <p className="muted" style={{ marginTop: 12 }}>{product.notes}</p>}
      </Card>

      <Card>
        <SectionHead title="Stock" />
        <div className="stepper-row">
          <button className="btn icon" onClick={() => void bump(-1)} disabled={product.stock_qty === 0} aria-label="Remove one">
            <Icon d={ICONS.minus} size={16} />
          </button>
          <b className="stepper-val">{product.stock_qty}</b>
          <button className="btn icon" onClick={() => void bump(1)} aria-label="Add one">
            <Icon d={ICONS.plus} size={16} />
          </button>
          <span className="muted small" style={{ marginLeft: 4 }}>Quick adjust when bottles come in or go out</span>
        </div>
        <Link to={`/sales/new?product=${product.id}`} className="btn primary block" style={{ marginTop: 12 }}>
          Record a sale
        </Link>
      </Card>

      <SectionHead title="Sales history" />
      {sales.length === 0 ? (
        <Card>
          <p className="muted small" style={{ margin: 0 }}>
            No sales recorded for this product yet — {soldQty === 0 ? '' : `${soldQty} sold · ${inr(soldRevenue)}`}
          </p>
        </Card>
      ) : (
        <Card className="flush">
          <div className="kv-row">
            <span>Total sold</span>
            <b>{soldQty} bottles · {inr(soldRevenue)}</b>
          </div>
          {sales.map((s) => (
            <Link key={s.id} to={`/sales/${s.id}/edit`} className="sale-row">
              <div className="sale-main">
                <b>{fmtDate(s.sale_date)}</b>
                <span className="muted small">
                  {s.qty} × {inr(Number(s.delivery_price))}
                  {s.buyer_name ? ` · ${s.buyer_name}` : ''}
                </span>
              </div>
              <div className="sale-right">
                <b>{inr(saleRevenue(s))}</b>
                {s.payment_status === 'pending' && <Badge tone="warn">Pending</Badge>}
              </div>
            </Link>
          ))}
        </Card>
      )}

      <button className={`btn block ${confirming ? 'danger' : 'danger-ghost'}`} onClick={() => void onDelete()}>
        <Icon d={ICONS.trash} size={16} /> {confirming ? 'Tap again to confirm delete' : 'Delete product'}
      </button>
      <div style={{ height: 12 }} />
    </Page>
  );
}
