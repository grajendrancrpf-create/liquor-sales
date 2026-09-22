import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Page, Card, Field, Icon, ICONS, Spinner } from '../components/ui';
import { getProduct, saveProduct, uploadProductImage } from '../lib/data';
import { useAuth } from '../context/AuthContext';
import { DEMO } from '../lib/demo';
import { CATEGORIES, type Category, type ProductInput } from '../types';

const num = (v: string, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) && v.trim() !== '' ? n : fallback;
};

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState<Category>('whisky');
  const [sizeMl, setSizeMl] = useState('750');
  const [abv, setAbv] = useState('');
  const [procurement, setProcurement] = useState('');
  const [sell, setSell] = useState('');
  const [stock, setStock] = useState('0');
  const [lowAt, setLowAt] = useState('3');
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const p = await getProduct(id);
        if (p) {
          setName(p.name);
          setBrand(p.brand ?? '');
          setCategory(p.category);
          setSizeMl(p.size_ml ? String(p.size_ml) : '');
          setAbv(p.abv != null ? String(p.abv) : '');
          setProcurement(String(p.procurement_price));
          setSell(String(p.sell_price));
          setStock(String(p.stock_qty));
          setLowAt(String(p.low_stock_at));
          setNotes(p.notes ?? '');
          setImageUrl(p.image_url);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const onFile = (f: File | null) => {
    setFile(f);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('Give the product a name.');
      return;
    }
    if (!user) {
      setError('You need to be signed in.');
      return;
    }
    setSaving(true);
    try {
      let url = imageUrl;
      if (file && !DEMO) {
        url = await uploadProductImage(user.id, file);
      }
      const input: ProductInput = {
        name: name.trim(),
        brand: brand.trim() || null,
        category,
        size_ml: sizeMl.trim() ? num(sizeMl) : null,
        abv: abv.trim() ? num(abv) : null,
        procurement_price: num(procurement),
        sell_price: num(sell),
        stock_qty: Math.max(0, Math.round(num(stock))),
        low_stock_at: Math.max(0, Math.round(num(lowAt, 3))),
        image_url: url,
        notes: notes.trim() || null,
      };
      const saved = await saveProduct(user.id, input, id);
      navigate(`/products/${saved.id}`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the product.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Page title={isEdit ? 'Edit product' : 'New product'}>
        <Spinner />
      </Page>
    );
  }

  return (
    <Page
      eyebrow="Inventory"
      title={isEdit ? 'Edit product' : 'New product'}
      subtitle="Photo, prices and stock"
    >
      <form onSubmit={submit}>
        <Card>
          <div className="photo-picker">
            {preview || imageUrl ? (
              <img src={preview ?? imageUrl ?? ''} alt="Product" className="photo-preview" />
            ) : (
              <span className="photo-fallback lg" aria-hidden>
                <Icon d={ICONS.camera} size={30} />
              </span>
            )}
            <div>
              <button type="button" className="btn" onClick={() => fileRef.current?.click()}>
                <Icon d={ICONS.camera} size={16} /> {preview || imageUrl ? 'Change photo' : 'Add photo'}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                hidden
                onChange={(e) => onFile(e.target.files?.[0] ?? null)}
              />
              <p className="muted small" style={{ margin: '8px 0 0' }}>
                Take a photo of the bottle or pick one from your gallery.
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <Field label="Product name *">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Royal Stag" required />
          </Field>
          <Field label="Brand">
            <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. Pernod Ricard" />
          </Field>
          <div className="grid-2">
            <Field label="Category">
              <select value={category} onChange={(e) => setCategory(e.target.value as Category)}>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Size (ml)">
              <input inputMode="numeric" value={sizeMl} onChange={(e) => setSizeMl(e.target.value)} placeholder="750" />
            </Field>
          </div>
          <div className="grid-2">
            <Field label="ABV %">
              <input inputMode="decimal" value={abv} onChange={(e) => setAbv(e.target.value)} placeholder="42.8" />
            </Field>
            <Field label="Low-stock alert at">
              <input inputMode="numeric" value={lowAt} onChange={(e) => setLowAt(e.target.value)} placeholder="3" />
            </Field>
          </div>
        </Card>

        <Card>
          <h3 className="card-title">Prices</h3>
          <div className="grid-2">
            <Field label="Procurement price (₹) *" hint="Private — shown only in the sales dashboard.">
              <input inputMode="decimal" value={procurement} onChange={(e) => setProcurement(e.target.value)} placeholder="640" required />
            </Field>
            <Field label="Sell price (₹) *" hint="Shown on the stock list.">
              <input inputMode="decimal" value={sell} onChange={(e) => setSell(e.target.value)} placeholder="850" required />
            </Field>
          </div>
          <Field label="Bottles in stock *">
            <input inputMode="numeric" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="0" required />
          </Field>
          <Field label="Notes">
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Anything worth remembering…" />
          </Field>
        </Card>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <Link to={isEdit && id ? `/products/${id}` : '/stock'} className="btn ghost">
            Cancel
          </Link>
          <button type="submit" className="btn primary" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add product'}
          </button>
        </div>
      </form>
      <div style={{ height: 12 }} />
    </Page>
  );
}
