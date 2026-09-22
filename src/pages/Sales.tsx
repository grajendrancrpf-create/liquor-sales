import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Page, Card, SectionHead, SegmentedControl, Badge, Spinner, Empty, Icon, ICONS } from '../components/ui';
import { getSales, deleteSale } from '../lib/data';
import { inr, fmtDate, todayISO } from '../lib/format';
import { saleRevenue, type Sale } from '../types';

type Period = 'today' | 'week' | 'month' | 'all';

function startOfWeekISO(): string {
  const d = new Date();
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  const pad = (x: number) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function startOfMonthISO(): string {
  const d = new Date();
  const pad = (x: number) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-01`;
}

export default function Sales() {
  const navigate = useNavigate();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('month');
  const [query, setQuery] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      setSales(await getSales());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const filtered = useMemo(() => {
    const today = todayISO();
    const from = period === 'today' ? today : period === 'week' ? startOfWeekISO() : period === 'month' ? startOfMonthISO() : '0000-00-00';
    const q = query.trim().toLowerCase();
    return sales.filter(
      (s) =>
        s.sale_date >= from &&
        (!q || s.product_name.toLowerCase().includes(q) || (s.buyer_name ?? '').toLowerCase().includes(q)),
    );
  }, [sales, period, query]);

  const revenue = useMemo(() => filtered.reduce((n, s) => n + saleRevenue(s), 0), [filtered]);
  const pending = useMemo(
    () => filtered.filter((s) => s.payment_status === 'pending').reduce((n, s) => n + (saleRevenue(s) - Number(s.amount_received)), 0),
    [filtered],
  );

  const onDelete = async (s: Sale) => {
    if (deleting !== s.id) {
      setDeleting(s.id);
      setTimeout(() => setDeleting(null), 4000);
      return;
    }
    await deleteSale(s.id);
    setDeleting(null);
    void refresh();
  };

  return (
    <Page
      eyebrow="Transactions"
      title="Sales log"
      subtitle={`${filtered.length} sales · ${inr(Math.round(revenue))} revenue`}
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

      <div className="search-row">
        <span className="search-ico">
          <Icon d={ICONS.search} size={17} />
        </span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search product or buyer…"
          aria-label="Search sales"
        />
      </div>

      {pending > 0 && (
        <Card className="warn-card slim">
          <div className="kv-row">
            <span>Pending to collect</span>
            <b>{inr(Math.round(pending))}</b>
          </div>
        </Card>
      )}

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <Empty
          illo={query ? 'search' : 'trend'}
          title={query ? 'No matches' : 'No sales yet'}
          text={query ? 'Try a different search.' : 'Record your first sale with the + button.'}
          action={
            !query ? (
              <button className="btn primary" onClick={() => navigate('/sales/new')}>
                Record a sale
              </button>
            ) : undefined
          }
        />
      ) : (
        <Card className="flush">
          {filtered.map((s) => (
            <div key={s.id} className="sale-row-wrap">
              <Link to={`/sales/${s.id}/edit`} className="sale-row">
                <div className="sale-main">
                  <b>{s.product_name}</b>
                  <span className="muted small">
                    {fmtDate(s.sale_date)} · {s.qty} × {inr(Number(s.delivery_price))}
                    {s.buyer_name ? ` · ${s.buyer_name}` : ''}
                  </span>
                </div>
                <div className="sale-right">
                  <b>{inr(saleRevenue(s))}</b>
                  {s.payment_status === 'pending' ? (
                    <Badge tone="warn">Pending</Badge>
                  ) : (
                    <Badge tone="pos">Paid</Badge>
                  )}
                </div>
              </Link>
              <button
                className={`btn icon danger-ghost sm ${deleting === s.id ? 'confirm' : ''}`}
                onClick={() => void onDelete(s)}
                aria-label={deleting === s.id ? 'Tap again to confirm delete' : 'Delete sale'}
                title={deleting === s.id ? 'Tap again to confirm' : 'Delete sale'}
              >
                <Icon d={ICONS.trash} size={15} />
              </button>
            </div>
          ))}
        </Card>
      )}

      <SectionHead title="" />
      <p className="muted small" style={{ textAlign: 'center' }}>
        Deleting a sale returns its bottles to stock.
      </p>
    </Page>
  );
}
