import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Page, Card, SectionHead, SegmentedControl, Badge, ProductPhoto, Spinner, Empty, useCountUp, Icon, ICONS } from '../components/ui';
import { getProducts, getSales } from '../lib/data';
import { inr, fmtDate, todayISO } from '../lib/format';
import { saleProfit, saleRevenue, type Product, type Sale } from '../types';

type Period = 'today' | 'week' | 'month' | 'all';

function startOfWeekISO(): string {
  const d = new Date();
  const day = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - day);
  const pad = (x: number) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function startOfMonthISO(): string {
  const d = new Date();
  const pad = (x: number) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-01`;
}

function Stat({ label, value, sub }: { label: string; value: number; sub?: string }) {
  const v = useCountUp(value);
  return (
    <div className="stat">
      <span className="stat-label">{label}</span>
      <b className="stat-value">{inr(Math.round(v))}</b>
      {sub && <span className="stat-sub">{sub}</span>}
    </div>
  );
}

export default function Dashboard() {
  const [period, setPeriod] = useState<Period>('month');
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [p, s] = await Promise.all([getProducts(), getSales()]);
        setProducts(p);
        setSales(s);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const today = todayISO();
    const from = period === 'today' ? today : period === 'week' ? startOfWeekISO() : period === 'month' ? startOfMonthISO() : '0000-00-00';
    return sales.filter((s) => s.sale_date >= from);
  }, [sales, period]);

  const totals = useMemo(() => {
    let revenue = 0, cost = 0, profit = 0, pending = 0;
    for (const s of filtered) {
      revenue += saleRevenue(s);
      cost += Number(s.procurement_price) * s.qty;
      profit += saleProfit(s);
      if (s.payment_status === 'pending') pending += saleRevenue(s) - Number(s.amount_received);
    }
    return { revenue, cost, profit, pending, margin: revenue > 0 ? (profit / revenue) * 100 : 0 };
  }, [filtered]);

  const byProduct = useMemo(() => {
    const map = new Map<string, { name: string; qty: number; revenue: number; cost: number; profit: number }>();
    for (const s of filtered) {
      const key = s.product_id ?? s.product_name;
      const e = map.get(key) ?? { name: s.product_name, qty: 0, revenue: 0, cost: 0, profit: 0 };
      e.qty += s.qty;
      e.revenue += saleRevenue(s);
      e.cost += Number(s.procurement_price) * s.qty;
      e.profit += saleProfit(s);
      map.set(key, e);
    }
    return [...map.values()].sort((a, b) => b.profit - a.profit).slice(0, 6);
  }, [filtered]);

  const lowStock = useMemo(
    () => products.filter((p) => p.stock_qty <= p.low_stock_at).sort((a, b) => a.stock_qty - b.stock_qty),
    [products],
  );

  const stockValue = useMemo(
    () => products.reduce((sum, p) => sum + Number(p.procurement_price) * p.stock_qty, 0),
    [products],
  );

  const recent = useMemo(() => filtered.slice(0, 5), [filtered]);

  const periodLabel = period === 'today' ? 'Today' : period === 'week' ? 'This week' : period === 'month' ? 'This month' : 'All time';

  return (
    <Page
      eyebrow="Sales dashboard"
      title="Overview"
      subtitle={`${periodLabel} · procurement prices visible only here`}
      right={
        <Link to="/sales/new" className="btn primary">
          <Icon d={ICONS.plus} size={16} /> New sale
        </Link>
      }
    >
      <SegmentedControl<Period>
        ariaLabel="Period"
        value={period}
        onChange={setPeriod}
        options={[
          { value: 'today', label: 'Today' },
          { value: 'week', label: 'Week' },
          { value: 'month', label: 'Month' },
          { value: 'all', label: 'All' },
        ]}
      />

      {loading ? (
        <Spinner />
      ) : (
        <>
          <div className="stat-grid">
            <Stat label="Revenue" value={totals.revenue} sub="delivery total" />
            <Stat label="Profit" value={totals.profit} sub={`${totals.margin.toFixed(1)}% margin`} />
            <Stat label="Procurement cost" value={totals.cost} sub="of goods sold" />
            <Stat label="Pending dues" value={totals.pending} sub="to collect" />
          </div>

          <Card>
            <div className="kv-row">
              <span>Money locked in stock</span>
              <b>{inr(Math.round(stockValue))}</b>
            </div>
            <div className="kv-row">
              <span>Bottles in stock</span>
              <b>{products.reduce((n, p) => n + p.stock_qty, 0)}</b>
            </div>
            <div className="kv-row">
              <span>Products</span>
              <b>{products.length}</b>
            </div>
          </Card>

          {lowStock.length > 0 && (
            <Card className="warn-card">
              <SectionHead title="Low stock" />
              <div className="low-list">
                {lowStock.map((p) => (
                  <Link key={p.id} to={`/products/${p.id}`} className="low-row">
                    <ProductPhoto url={p.image_url} name={p.name} size={40} radius={12} />
                    <span className="low-name">{p.name}</span>
                    <Badge tone={p.stock_qty === 0 ? 'neg' : 'warn'}>
                      {p.stock_qty === 0 ? 'Out' : `${p.stock_qty} left`}
                    </Badge>
                  </Link>
                ))}
              </div>
            </Card>
          )}

          <SectionHead title="Profit by product" action={<Link to="/sales" className="link">All sales</Link>} />
          {byProduct.length === 0 ? (
            <Empty illo="trend" title="No sales yet" text="Record your first sale with the + button below." />
          ) : (
            <Card className="flush">
              {byProduct.map((r) => (
                <div key={r.name} className="profit-row">
                  <div className="profit-main">
                    <b>{r.name}</b>
                    <span className="muted small">{r.qty} sold · {inr(Math.round(r.revenue))} revenue</span>
                  </div>
                  <div className="profit-nums">
                    <span className="muted small">cost {inr(Math.round(r.cost))}</span>
                    <b className="t-pos">+{inr(Math.round(r.profit))}</b>
                  </div>
                </div>
              ))}
            </Card>
          )}

          {recent.length > 0 && (
            <>
              <SectionHead title="Recent sales" action={<Link to="/sales" className="link">View all</Link>} />
              <Card className="flush">
                {recent.map((s) => (
                  <Link key={s.id} to={`/sales/${s.id}/edit`} className="sale-row">
                    <div className="sale-main">
                      <b>{s.product_name}</b>
                      <span className="muted small">
                        {fmtDate(s.sale_date)} · {s.qty} × {inr(Number(s.delivery_price))}
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
            </>
          )}
        </>
      )}
      <div style={{ height: 8 }} />
      <p className="muted small" style={{ textAlign: 'center' }}>
        Procurement prices appear only on this screen.
      </p>
    </Page>
  );
}
