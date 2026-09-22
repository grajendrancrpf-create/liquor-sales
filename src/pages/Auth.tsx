import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Field } from '../components/ui';

export default function Auth() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [checkMail, setCheckMail] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === 'signin') {
        const err = await signIn(email.trim(), password);
        if (err) setError(err);
        else navigate('/', { replace: true });
      } else {
        if (!name.trim()) {
          setError('Please enter your name.');
          return;
        }
        const err = await signUp(email.trim(), password, name.trim());
        if (err) setError(err);
        else setCheckMail(true);
      }
    } finally {
      setBusy(false);
    }
  };

  if (checkMail) {
    return (
      <div className="auth-wrap">
        <AuthBrand />
        <div className="auth-card">
          <h2>Check your inbox</h2>
          <p className="sub">
            We sent a confirmation link to <b>{email}</b>. Tap it, then sign in here.
          </p>
          <button
            className="btn primary block"
            onClick={() => {
              setCheckMail(false);
              setMode('signin');
            }}
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrap">
      <AuthBrand />
      <div className="auth-card">
        <h2>{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h2>
        <p className="sub">
          {mode === 'signin'
            ? 'Sign in to open your lending ledger.'
            : 'Your private ledger is a minute away.'}
        </p>
        <form onSubmit={submit}>
          {mode === 'signup' && (
            <Field label="Full name">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                autoComplete="name"
              />
            </Field>
          )}
          <Field label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </Field>
          <Field label="Password">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'signin' ? 'Your password' : 'Choose a strong password'}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              required
              minLength={6}
            />
          </Field>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn primary block" disabled={busy}>
            {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>
        <p className="switch-mode">
          {mode === 'signin' ? (
            <>
              New here?{' '}
              <button className="link" onClick={() => { setMode('signup'); setError(null); }}>
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button className="link" onClick={() => { setMode('signin'); setError(null); }}>
                Sign in
              </button>
            </>
          )}
        </p>
        <p className="fineprint">
          Secured by Supabase Auth. Your data stays in your own database.
        </p>
      </div>
    </div>
  );
}

export function AuthGate() {
  return <Auth />;
}

function AuthBrand() {
  return (
    <div className="auth-brand">
      <div className="brand-mark">S</div>
      <h1>StockSell</h1>
      <p className="tag">Your private liquor sales ledger — stock, sales and profit, beautifully tracked.</p>
    </div>
  );
}
