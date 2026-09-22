import { NavLink } from 'react-router-dom';

const TABS = [
  { to: '/', label: 'Home', end: true, icon: HomeIcon },
  { to: '/stock', label: 'Stock', icon: StockIcon },
  { to: '/sales', label: 'Sales', icon: SalesIcon },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Primary">
      {TABS.slice(0, 2).map(({ to, label, end, icon: Icon }) => (
        <Tab key={to} to={to} label={label} end={end} Icon={Icon} />
      ))}
      <NavLink to="/sales/new" className="tab-fab" aria-label="Record a new sale">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </NavLink>
      {TABS.slice(2).map(({ to, label, end, icon: Icon }) => (
        <Tab key={to} to={to} label={label} end={end} Icon={Icon} />
      ))}
    </nav>
  );
}

function Tab({ to, label, end, Icon }: { to: string; label: string; end?: boolean; Icon: () => JSX.Element }) {
  return (
    <NavLink to={to} end={end} className={({ isActive }) => `tab${isActive ? ' active' : ''}`}>
      <Icon />
      <span>{label}</span>
    </NavLink>
  );
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M9.5 21v-6h5v6" />
    </svg>
  );
}
function StockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8 12 3 3 8v8l9 5 9-5Z" />
      <path d="M3 8l9 5 9-5M12 13v8" />
    </svg>
  );
}
function SalesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M15 7h6v6" />
    </svg>
  );
}
function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.04 1.56V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.04-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1.04H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.65 8.9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h.09A1.7 1.7 0 0 0 10.14 3V3a2 2 0 1 1 4 0v.09c0 .68.4 1.3 1.04 1.56.6.25 1.3.11 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.09c.25.6.88 1.04 1.56 1.04H21a2 2 0 1 1 0 4h-.09c-.68 0-1.3.4-1.51 1.04Z" />
    </svg>
  );
}
