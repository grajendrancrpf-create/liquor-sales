/** Format a number as Indian Rupees with en-IN (lakh/crore) grouping. */
export function inr(n: number | null | undefined): string {
  const v = Number(n) || 0;
  const hasPaise = Math.abs(v % 1) > 0.004;
  return (
    '₹' +
    v.toLocaleString('en-IN', {
      minimumFractionDigits: hasPaise ? 2 : 0,
      maximumFractionDigits: 2,
    })
  );
}

/** Convert YYYY-MM-DD to DD/MM/YYYY. */
export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const [y, m, d] = iso.slice(0, 10).split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

/** Today's date as YYYY-MM-DD (local time). */
export function todayISO(): string {
  const d = new Date();
  const pad = (x: number) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Add n months to a YYYY-MM-DD date string. */
export function addMonthsISO(iso: string, n: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1 + n, d);
  const pad = (x: number) => String(x).padStart(2, '0');
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}

/** Display a stored phone as "+91 98765 43210". */
export function fmtPhone(phone: string | null | undefined): string {
  if (!phone) return '—';
  const digits = phone.replace(/\D/g, '');
  const local =
    digits.startsWith('91') && digits.length > 10 ? digits.slice(-10) : digits;
  if (local.length !== 10) return phone;
  return `+91 ${local.slice(0, 5)} ${local.slice(5)}`;
}

/** Normalise user input to "+91XXXXXXXXXX" (or "" if blank). */
export function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, '').replace(/^0+/, '');
  if (!digits) return '';
  const local = (digits.startsWith('91') ? digits.slice(2) : digits).slice(-10);
  return local ? `+91${local}` : '';
}

export const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

export function isValidPan(pan: string): boolean {
  return PAN_RE.test(pan.trim().toUpperCase());
}
