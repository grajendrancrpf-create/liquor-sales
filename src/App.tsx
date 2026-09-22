import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { isSupabaseConfigured } from './lib/supabase';
import { DEMO } from './lib/demo';
import BottomNav from './components/BottomNav';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Stock from './pages/Stock';
import ProductDetail from './pages/ProductDetail';
import ProductForm from './pages/ProductForm';
import Sales from './pages/Sales';
import SaleForm from './pages/SaleForm';
import Settings from './pages/Settings';

function SetupNotice() {
  return (
    <div className="setup-wrap">
      <h1>Almost there</h1>
      <p>
        StockSell needs its Supabase credentials before it can run.{' '}
        <code style={{ whiteSpace: 'normal' }}>
          1. Copy <b>.env.example</b> to <b>.env</b>
          <br />
          2. Paste your Supabase project URL and anon key
          <br />
          3. Restart the dev server
        </code>
      </p>
      <p className="muted small">
        Find the values in your Supabase dashboard under Project Settings → API.
      </p>
    </div>
  );
}

function Shell() {
  return (
    <>
      <div className="aurora" aria-hidden>
        <i className="b1" />
        <i className="b2" />
        <i className="b3" />
        <i className="b4" />
        <i className="b5" />
      </div>
      <div className="app-shell">
        <Outlet />
        <BottomNav />
      </div>
    </>
  );
}

function Protected() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Auth />;
  return <Shell />;
}

export default function App() {
  if (!isSupabaseConfigured && !DEMO) return <SetupNotice />;
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Protected />}>
            <Route index element={<Dashboard />} />
            <Route path="stock" element={<Stock />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/:id" element={<ProductDetail />} />
            <Route path="products/:id/edit" element={<ProductForm />} />
            <Route path="sales" element={<Sales />} />
            <Route path="sales/new" element={<SaleForm />} />
            <Route path="sales/:id/edit" element={<SaleForm />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
