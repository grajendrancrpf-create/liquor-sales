import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { DEMO } from '../lib/demo';
import { Page, Card, Field } from '../components/ui';

export default function Settings() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(profile?.full_name ?? '');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const saveName = async () => {
    if (!user || !name.trim() || DEMO) return;
    setSaving(true);
    const { error } = await db()
      .from('profiles')
      .upsert({ id: user.id, full_name: name.trim() }, { onConflict: 'id' });
    setSaving(false);
    if (!error) {
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const logout = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  return (
    <Page eyebrow="Account" title="Settings" subtitle={user?.email}>
      <Card>
        <h3 className="card-title">Profile</h3>
        <Field label="Full name">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
        </Field>
        <button className="btn primary" onClick={saveName} disabled={saving || DEMO} style={{ marginTop: 2 }}>
          {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save name'}
        </button>
      </Card>

      <Card>
        <h3 className="card-title">About StockSell</h3>
        <p className="muted small" style={{ margin: '0 0 8px', lineHeight: 1.6 }}>
          Your private liquor sales ledger. Track stock, record sales at the
          delivery price, and watch profit in the sales dashboard. Procurement
          prices are never shown outside the dashboard.
        </p>
        <p className="muted small" style={{ margin: '0 0 8px', lineHeight: 1.6 }}>
          Your data lives in your own Supabase project. Amounts use Indian
          numbering (lakh/crore), dates are DD/MM/YYYY.
        </p>
        <p className="muted small" style={{ margin: 0 }}>Signed in as {user?.email}</p>
      </Card>

      {!DEMO && (
        <button className="btn danger-ghost block" onClick={logout}>
          Sign out
        </button>
      )}
    </Page>
  );
}
