import { useEffect, useRef, useState, type ReactNode } from 'react';

/* ---------------- page shell ---------------- */
export function Page({
  eyebrow,
  title,
  subtitle,
  right,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="page">
      <header className="page-head">
        <div>
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h1>{title}</h1>
          {subtitle && <p className="sub">{subtitle}</p>}
        </div>
        {right}
      </header>
      {children}
    </div>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`card ${className}`}>{children}</section>;
}

export function SectionHead({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="section-head">
      <h3>{title}</h3>
      {action}
    </div>
  );
}

/* ---------------- field ---------------- */
export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint && <small className="muted" style={{ display: 'block', marginTop: 6, fontSize: 12.5 }}>{hint}</small>}
    </label>
  );
}

/* ---------------- segmented control ---------------- */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  scroll = false,
  ariaLabel,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  scroll?: boolean;
  ariaLabel?: string;
}) {
  return (
    <div className={`seg${scroll ? ' scroll' : ''}`} role="tablist" aria-label={ariaLabel} style={{ marginBottom: 14 }}>
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          className={value === o.value ? 'active' : ''}
          onClick={() => onChange(o.value)}
          type="button"
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ---------------- badges ---------------- */
export function Badge({ tone, children }: { tone: 'pos' | 'warn' | 'neg' | 'muted'; children: ReactNode }) {
  return <span className={`badge b-${tone}`}>{children}</span>;
}

/* ---------------- product photo ---------------- */
export function ProductPhoto({
  url,
  name,
  size = 52,
  radius = 16,
}: {
  url: string | null | undefined;
  name: string;
  size?: number;
  radius?: number;
}) {
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        width={size}
        height={size}
        style={{ width: size, height: size, borderRadius: radius, objectFit: 'cover', flexShrink: 0 }}
        loading="lazy"
      />
    );
  }
  return (
    <span
      className="photo-fallback"
      aria-hidden
      style={{ width: size, height: size, borderRadius: radius }}
    >
      <svg viewBox="0 0 24 24" width={size * 0.52} height={size * 0.52} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 2h4M10 5h4M9.5 5c0 2-3.5 3.5-3.5 8v6a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-6c0-4.5-3.5-6-3.5-8" />
        <path d="M7.5 13h9" />
      </svg>
    </span>
  );
}

/* ---------------- loading ---------------- */
export function Spinner() {
  return (
    <div className="spinner-wrap">
      <div className="spinner" />
    </div>
  );
}

export function SkeletonList({ rows = 4 }: { rows?: number }) {
  return (
    <div aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skel-row">
          <div className="skel" style={{ width: 46, height: 46, borderRadius: 16 }} />
          <div style={{ flex: 1 }}>
            <div className="skel" style={{ width: '55%', marginBottom: 8 }} />
            <div className="skel" style={{ width: '35%', minHeight: 14 }} />
          </div>
          <div className="skel" style={{ width: 72, minHeight: 22 }} />
        </div>
      ))}
    </div>
  );
}

/* ---------------- empty state ---------------- */
function IlloBox() {
  return (
    <svg className="empty-illo" viewBox="0 0 120 96" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 34 60 16l40 18v44L60 96 20 78Z" />
      <path d="M20 34l40 18 40-18M60 52v44" />
    </svg>
  );
}
function IlloSearch() {
  return (
    <svg className="empty-illo" viewBox="0 0 120 96" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="52" cy="44" r="24" />
      <path d="m70 62 20 20" />
      <path d="M44 44h16M52 36v16" />
    </svg>
  );
}
function IlloTrend() {
  return (
    <svg className="empty-illo" viewBox="0 0 120 96" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 78h18l12-24 16 16 12-28 8 10h26" />
      <path d="M80 42h12v12" />
    </svg>
  );
}

export function Empty({
  illo = 'box',
  title,
  text,
  action,
}: {
  illo?: 'box' | 'search' | 'trend';
  title: string;
  text: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      {illo === 'box' && <IlloBox />}
      {illo === 'search' && <IlloSearch />}
      {illo === 'trend' && <IlloTrend />}
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}

/* ---------------- icons ---------------- */
export function Icon({ d, size = 18 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

export const ICONS = {
  plus: 'M12 5v14M5 12h14',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.35-4.35',
  chevR: 'm9 6 6 6-6 6',
  pencil: 'M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z',
  check: 'M20 6 9 17l-5-5',
  trash: 'M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6',
  wallet: 'M20 7H4a2 2 0 0 1 0-4h14v4Zm0 0a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5',
  trend: 'm22 7-8.5 8.5-5-5L2 17',
  clock: 'M12 6v6l4 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
  camera: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2ZM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
  minus: 'M5 12h14',
};

/* ---------------- count-up ---------------- */
export function useCountUp(target: number, duration = 900) {
  const [val, setVal] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(from + (target - from) * eased);
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return val;
}
