import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Page, Card, Field, SegmentedControl, ProductPhoto, Icon, ICONS, Spinner } from '../components/ui';
import { getProducts, getSale, saveSale, type SaleSaveInput } from '../lib/data';
import { useAuth } from '../context/AuthContext';
import { inr, todayISO } from '../lib/format';
import { categoryLabel, type Product, type Sale, type PaymentStatus } from '../types';

const num = (v: string, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) && v.trim() !== '' ? n : fallback;
};

export default function SaleForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existing, setExisting] = useState<Sale | null>(null);

  const [productId, setProductId] = useState(params.get('product') ?? '');
  const [qty, setQty] = useState('1');
  const [deliveryPrice, setDeliveryPrice] = useState('');
  const [saleDate, setSaleDate] = useState(todayISO());
  const [buyer, setBuyer] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<PaymentStatus>('paid');
  const [received, setReceived] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [ps, s] = await Promise.all([getProducts(), id ? getSale(id) : Promise.resolve(null)]);
        setProducts(ps);
        if (s) {
          setExisting(s);
          setProductId(s.product_id ?? '');
          setQty(String(s.qty));
          setDeliveryPrice(String(s.delivery_price));
          setSaleDate(s.sale_date);
          setBuyer(s.buyer_name ?? '');
          setPhone(s.buyer_phone ?? '');
          setStatus(s.payment_status);
          setReceived(String(s.amount_received));
          setNotes(s.notes ?? '');
        } else if (params.get('product')) {
          const p = ps.find((x) => x.id === params.get('product'));
          if (p) setDeliveryPrice(String(p.sell_price));
        }
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const product = useMemo(() => products.find((p) => p.id === productId) ?? null, [products, productId]);

  // Prefill delivery price with the sell price when the product changes (new sales only).
  const onProductChange = (pid: string) => {
    setProductId(pid);
    if (!isEdit) {
      const p = products.find((x) => x.id === pid);
      setDeliveryPrice(p ? String(p.sell_price) : '');
    }
  };

  const lineTotal = num(qty) * num(deliveryPrice);
  const available = product ? product.stock_qty + (existing && existing.product_id === product.id ? existing.qty : 0) : 0;

  // Default amount received = full total for paid sales.
  useEffect(() => {
    if (status === 'paid' && !isEdit) setReceived(String(lineTotal || ''));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, lineTotal]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!product || !user) {
      setError('Choose a product first.');
      return;
    }
    const q = Math.round(num(qty));
    if (q < 1) {
      setError('Quantity must be at least 1.');
      return;
    }
    if (q > available) {
      setError(`Only ${available} bottle${available === 1 ? '' : 's'} in stock.`);
      return;
    }
    setSaving(true);
    try {
      const input: SaleSaveInput = {
        product,
        product_id: product.id,
        product_name: product.name,
        qty: q,
        procurement_price: product.procurement_price,
        sell_price: product.sell_price,
        delivery_price: num(deliveryPrice),
        sale_date: saleDate || todayISO(),
        buyer_name: buyer.trim() || null,
        buyer_phone: phone.trim() || null,
        payment_status: status,
        amount_received: num(received),
        notes: notes.trim() || null,
      };
      const saved = await saveSale(user.id, input, existing ?? undefined);
      void saved;
      navigate('/sales', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the sale.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Page title={isEdit ? 'Edit sale' : 'New sale'}>
        <Spinner />
      </Page>
    );
  }

  return (
    <Page eyebrow="Transaction" title={isEdit ? 'Edit sale' : 'New sale'} subtitle="Delivery price is entered here">
      <form onSubmit={submit}>
        <Card>
          <Field label="Product *">
            <select value={productId} onChange={(e) => onProductChange(e.target.value)} required>
              <option value="">Choose a product…</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {inr(Number(p.sell_price))} ({p.stock_qty} in stock)
                </option>
              ))}
            </select>
          </Field>
          {product && (
            <div className="picked-product">
              <ProductPhoto url={product.image_url} name={product.name} size={48} radius={14} />
              <div>
                <b>{product.name}</b>
                <span className="muted small">
                  {categoryLabel(product.category)} · sell price {inr(Number(product.sell_price))} · {available} available
                </span>
              </div>
            </div>
          )}
          <div className="grid-2">
            <Field label="Quantity *">
              <div className="stepper-row sm">
                <button type="button" className="btn icon" onClick={() => setQty(String(Math.max(1, num(qty) - 1)))} aria-label="Decrease">
                  <Icon d={ICONS.minus} size={15} />
                </button>
                <input inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value)} aria-label="Quantity" />
                <button type="button" className="btn icon" onClick={() => setQty(String(num(qty) + 1))} aria-label="Increase">
                  <Icon d={ICONS.plus} size={15} />
                </button>
              </div>
            </Field>
            <Field label="Sale date">
              <input type="date" value={saleDate} onChange={(e) => setSaleDate(e.target.value)} />
            </Field>
          </div>
          <Field label="Delivery price per bottle (₹) *" hint="Final price charged at delivery. Prefilled with the sell price — change it if you gave a discount or charged extra.">
            <input inputMode="decimal" value={deliveryPrice} onChange={(e) => setDeliveryPrice(e.target.value)} placeholder="850" required />
          </Field>
          {lineTotal > 0 && (
            <div className="total-strip">
              <span>Total</span>
              <b>{inr(lineTotal)}</b>
            </div>
          )}
        </Card>

        <Card>
          <h3 className="card-title">Buyer & payment</h3>
          <Field label="Buyer name">
            <input value={buyer} onChange={(e) => setBuyer(e.target.value)} placeholder="e.g. Amit Verma" />
          </Field>
          <Field label="Buyer phone">
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91…" inputMode="tel" />
          </Field>
          <Field label="Payment">
            <SegmentedControl<PaymentStatus>
              ariaLabel="Payment status"
              value={status}
              onChange={setStatus}
              options={[
                { value: 'paid', label: 'Paid' },
                { value: 'pending', label: 'Pending' },
              ]}
            />
          </Field>
          <Field label="Amount received (₹)" hint={status === 'pending' ? 'Collect the rest later — it shows as a due in the dashboard.' : undefined}>
            <input inputMode="decimal" value={received} onChange={(e) => setReceived(e.target.value)} placeholder={String(lineTotal || 0)} />
          </Field>
          <Field label="Notes">
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Optional…" />
          </Field>
        </Card>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <Link to="/sales" className="btn ghost">
            Cancel
          </Link>
          <button type="submit" className="btn primary" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Record sale'}
          </button>
        </div>
      </form>
      <div style={{ height: 12 }} />
    </Page>
  );
}
