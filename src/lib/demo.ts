import type { Product, Sale } from '../types';

/**
 * Demo/preview mode. Activated with `?demo=1` in the URL (used for design
 * screenshots). The app runs entirely on in-memory mock data — no Supabase.
 */
export const DEMO =
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).get('demo') === '1';

const UID = 'demo-user';

export const DEMO_PRODUCTS: Product[] = [
  {
    id: 'p1', user_id: UID, name: 'Royal Stag', brand: 'Pernod Ricard', category: 'whisky',
    size_ml: 750, abv: 42.8, procurement_price: 640, sell_price: 850, stock_qty: 14,
    low_stock_at: 4, image_url: null, notes: 'Fast mover',
    created_at: '2026-08-02T10:00:00Z', updated_at: '2026-09-20T10:00:00Z',
  },
  {
    id: 'p2', user_id: UID, name: "Blender's Pride", brand: 'Pernod Ricard', category: 'whisky',
    size_ml: 750, abv: 42.8, procurement_price: 690, sell_price: 920, stock_qty: 9,
    low_stock_at: 4, image_url: null, notes: null,
    created_at: '2026-08-02T10:00:00Z', updated_at: '2026-09-18T10:00:00Z',
  },
  {
    id: 'p3', user_id: UID, name: 'Smirnoff No. 21', brand: 'Diageo', category: 'vodka',
    size_ml: 750, abv: 42.8, procurement_price: 980, sell_price: 1350, stock_qty: 3,
    low_stock_at: 4, image_url: null, notes: null,
    created_at: '2026-08-10T10:00:00Z', updated_at: '2026-09-21T10:00:00Z',
  },
  {
    id: 'p4', user_id: UID, name: 'Bacardi White', brand: 'Bacardi', category: 'rum',
    size_ml: 750, abv: 42.8, procurement_price: 720, sell_price: 990, stock_qty: 11,
    low_stock_at: 4, image_url: null, notes: null,
    created_at: '2026-08-15T10:00:00Z', updated_at: '2026-09-15T10:00:00Z',
  },
  {
    id: 'p5', user_id: UID, name: 'Sula Dindori Red', brand: 'Sula', category: 'wine',
    size_ml: 750, abv: 13.5, procurement_price: 480, sell_price: 750, stock_qty: 6,
    low_stock_at: 3, image_url: null, notes: 'Weekend demand',
    created_at: '2026-09-01T10:00:00Z', updated_at: '2026-09-19T10:00:00Z',
  },
];

export const DEMO_SALES: Sale[] = [
  { id: 's1', user_id: UID, product_id: 'p1', product_name: 'Royal Stag', qty: 2, procurement_price: 640, sell_price: 850, delivery_price: 850, sale_date: '2026-09-22', buyer_name: 'Amit Verma', buyer_phone: '+919876543210', payment_status: 'paid', amount_received: 1700, notes: null, created_at: '2026-09-22T11:00:00Z' },
  { id: 's2', user_id: UID, product_id: 'p3', product_name: 'Smirnoff No. 21', qty: 1, procurement_price: 980, sell_price: 1350, delivery_price: 1300, sale_date: '2026-09-22', buyer_name: 'Rohit S', buyer_phone: null, payment_status: 'pending', amount_received: 0, notes: 'Pay by Friday', created_at: '2026-09-22T12:30:00Z' },
  { id: 's3', user_id: UID, product_id: 'p2', product_name: "Blender's Pride", qty: 3, procurement_price: 690, sell_price: 920, delivery_price: 920, sale_date: '2026-09-21', buyer_name: 'Karan Mehta', buyer_phone: '+919812345678', payment_status: 'paid', amount_received: 2760, notes: null, created_at: '2026-09-21T18:00:00Z' },
  { id: 's4', user_id: UID, product_id: 'p4', product_name: 'Bacardi White', qty: 2, procurement_price: 720, sell_price: 990, delivery_price: 1050, sale_date: '2026-09-20', buyer_name: 'Sneha Iyer', buyer_phone: null, payment_status: 'paid', amount_received: 2100, notes: null, created_at: '2026-09-20T19:15:00Z' },
  { id: 's5', user_id: UID, product_id: 'p1', product_name: 'Royal Stag', qty: 4, procurement_price: 640, sell_price: 850, delivery_price: 830, sale_date: '2026-09-18', buyer_name: 'Party order — Vikram', buyer_phone: null, payment_status: 'paid', amount_received: 3320, notes: 'Bulk rate', created_at: '2026-09-18T17:00:00Z' },
  { id: 's6', user_id: UID, product_id: 'p5', product_name: 'Sula Dindori Red', qty: 2, procurement_price: 480, sell_price: 750, delivery_price: 750, sale_date: '2026-09-17', buyer_name: 'Amit Verma', buyer_phone: '+919876543210', payment_status: 'paid', amount_received: 1500, notes: null, created_at: '2026-09-17T20:00:00Z' },
  { id: 's7', user_id: UID, product_id: 'p2', product_name: "Blender's Pride", qty: 1, procurement_price: 690, sell_price: 920, delivery_price: 920, sale_date: '2026-09-15', buyer_name: 'Rohit S', buyer_phone: null, payment_status: 'pending', amount_received: 400, notes: 'Partial', created_at: '2026-09-15T14:00:00Z' },
  { id: 's8', user_id: UID, product_id: 'p4', product_name: 'Bacardi White', qty: 1, procurement_price: 720, sell_price: 990, delivery_price: 990, sale_date: '2026-09-12', buyer_name: 'Karan Mehta', buyer_phone: '+919812345678', payment_status: 'paid', amount_received: 990, notes: null, created_at: '2026-09-12T16:45:00Z' },
];

// Mutable in-memory copies used while DEMO is on.
export const demoStore = {
  products: DEMO_PRODUCTS.map((p) => ({ ...p })),
  sales: DEMO_SALES.map((s) => ({ ...s })),
};

export function demoUid(): string {
  return 'demo-user';
}

export function demoId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}
