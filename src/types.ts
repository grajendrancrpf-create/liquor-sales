export type Category =
  | 'whisky'
  | 'vodka'
  | 'gin'
  | 'rum'
  | 'tequila'
  | 'wine'
  | 'beer'
  | 'brandy'
  | 'liqueur'
  | 'champagne'
  | 'other';

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'whisky', label: 'Whisky' },
  { value: 'vodka', label: 'Vodka' },
  { value: 'gin', label: 'Gin' },
  { value: 'rum', label: 'Rum' },
  { value: 'tequila', label: 'Tequila' },
  { value: 'wine', label: 'Wine' },
  { value: 'beer', label: 'Beer' },
  { value: 'brandy', label: 'Brandy' },
  { value: 'liqueur', label: 'Liqueur' },
  { value: 'champagne', label: 'Champagne' },
  { value: 'other', label: 'Other' },
];

export function categoryLabel(c: string | null | undefined): string {
  return CATEGORIES.find((x) => x.value === c)?.label ?? 'Other';
}

export interface Product {
  id: string;
  user_id: string;
  name: string;
  brand: string | null;
  category: Category;
  size_ml: number | null;
  abv: number | null;
  /** Private: what you paid your source. Shown only in the sales dashboard. */
  procurement_price: number;
  /** Public asking price shown on the stock list. */
  sell_price: number;
  stock_qty: number;
  low_stock_at: number;
  image_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type ProductInput = Omit<Product, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

export type PaymentStatus = 'paid' | 'pending';

export interface Sale {
  id: string;
  user_id: string;
  product_id: string | null;
  product_name: string;
  qty: number;
  /** Snapshot of procurement price at sale time (private). */
  procurement_price: number;
  sell_price: number;
  /** Final price actually charged at delivery. */
  delivery_price: number;
  sale_date: string; // YYYY-MM-DD
  buyer_name: string | null;
  buyer_phone: string | null;
  payment_status: PaymentStatus;
  amount_received: number;
  notes: string | null;
  created_at: string;
}

export type SaleInput = Omit<Sale, 'id' | 'user_id' | 'created_at'>;

export interface Profile {
  id: string;
  full_name: string | null;
  created_at: string;
}

/** Profit on one sale row. */
export function saleProfit(s: Pick<Sale, 'delivery_price' | 'procurement_price' | 'qty'>): number {
  return (Number(s.delivery_price) - Number(s.procurement_price)) * Number(s.qty);
}

/** Revenue (delivery total) on one sale row. */
export function saleRevenue(s: Pick<Sale, 'delivery_price' | 'qty'>): number {
  return Number(s.delivery_price) * Number(s.qty);
}
