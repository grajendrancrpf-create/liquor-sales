import { db } from './supabase';
import { DEMO, demoStore, demoUid, demoId } from './demo';
import type { Product, ProductInput, Sale, SaleInput } from '../types';

/* ---------------- products ---------------- */

export async function getProducts(): Promise<Product[]> {
  if (DEMO) return [...demoStore.products].sort((a, b) => a.name.localeCompare(b.name));
  const { data, error } = await db().from('products').select('*').order('name');
  if (error) throw error;
  return (data ?? []) as Product[];
}

export async function getProduct(id: string): Promise<Product | null> {
  if (DEMO) return demoStore.products.find((p) => p.id === id) ?? null;
  const { data, error } = await db().from('products').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return (data as Product | null) ?? null;
}

export async function saveProduct(userId: string, input: ProductInput, id?: string): Promise<Product> {
  if (DEMO) {
    if (id) {
      const i = demoStore.products.findIndex((p) => p.id === id);
      const updated = { ...demoStore.products[i], ...input, updated_at: new Date().toISOString() };
      demoStore.products[i] = updated;
      return updated;
    }
    const created: Product = {
      ...input, id: demoId('p'), user_id: demoUid(),
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    };
    demoStore.products.push(created);
    return created;
  }
  const row = { ...input, user_id: userId, updated_at: new Date().toISOString() };
  if (id) {
    const { data, error } = await db().from('products').update(row).eq('id', id).select().single();
    if (error) throw error;
    return data as Product;
  }
  const { data, error } = await db().from('products').insert(row).select().single();
  if (error) throw error;
  return data as Product;
}

export async function deleteProduct(id: string): Promise<void> {
  if (DEMO) {
    demoStore.products = demoStore.products.filter((p) => p.id !== id);
    return;
  }
  const { error } = await db().from('products').delete().eq('id', id);
  if (error) throw error;
}

export async function adjustStock(id: string, delta: number): Promise<Product> {
  if (DEMO) {
    const p = demoStore.products.find((x) => x.id === id);
    if (!p) throw new Error('Product not found');
    p.stock_qty = Math.max(0, p.stock_qty + delta);
    p.updated_at = new Date().toISOString();
    return { ...p };
  }
  const current = await getProduct(id);
  if (!current) throw new Error('Product not found');
  const { data, error } = await db()
    .from('products')
    .update({ stock_qty: Math.max(0, current.stock_qty + delta), updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Product;
}

/* ---------------- sales ---------------- */

export async function getSales(): Promise<Sale[]> {
  if (DEMO)
    return [...demoStore.sales].sort((a, b) =>
      b.sale_date.localeCompare(a.sale_date) || b.created_at.localeCompare(a.created_at),
    );
  const { data, error } = await db()
    .from('sales')
    .select('*')
    .order('sale_date', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Sale[];
}

export async function getSale(id: string): Promise<Sale | null> {
  if (DEMO) return demoStore.sales.find((s) => s.id === id) ?? null;
  const { data, error } = await db().from('sales').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return (data as Sale | null) ?? null;
}

export interface SaleSaveInput extends SaleInput {
  /** product row at the moment of sale (for stock + price snapshots) */
  product: Product;
}

/**
 * Create or update a sale, keeping product stock in sync.
 * For edits: the previous sale's qty is restored to its product first.
 */
export async function saveSale(
  userId: string,
  input: SaleSaveInput,
  existing?: Sale,
): Promise<Sale> {
  const { product, ...row } = input;
  if (DEMO) {
    if (existing) {
      const oldProd = demoStore.products.find((p) => p.id === existing.product_id);
      if (oldProd) oldProd.stock_qty += existing.qty;
    }
    const prod = demoStore.products.find((p) => p.id === product.id);
    if (!prod) throw new Error('Product not found');
    const available = prod.stock_qty + (existing && existing.product_id === product.id ? 0 : 0);
    if (row.qty > available) throw new Error(`Only ${available} in stock`);
    prod.stock_qty -= row.qty;
    const full: Sale = {
      ...row, product_id: product.id, product_name: product.name,
      procurement_price: product.procurement_price, sell_price: product.sell_price,
    } as Sale;
    if (existing) {
      const i = demoStore.sales.findIndex((s) => s.id === existing.id);
      demoStore.sales[i] = { ...existing, ...full };
      return demoStore.sales[i];
    }
    const created: Sale = { ...full, id: demoId('s'), user_id: demoUid(), created_at: new Date().toISOString() };
    demoStore.sales.push(created);
    return created;
  }

  // Restore stock from the previous version of this sale (if editing).
  if (existing?.product_id) {
    const oldProd = await getProduct(existing.product_id);
    if (oldProd) {
      await db()
        .from('products')
        .update({ stock_qty: oldProd.stock_qty + existing.qty, updated_at: new Date().toISOString() })
        .eq('id', oldProd.id);
    }
  }

  const fresh = await getProduct(product.id);
  if (!fresh) throw new Error('Product not found');
  if (row.qty > fresh.stock_qty) throw new Error(`Only ${fresh.stock_qty} in stock`);

  const saleRow = {
    user_id: userId,
    product_id: product.id,
    product_name: product.name,
    qty: row.qty,
    procurement_price: fresh.procurement_price,
    sell_price: fresh.sell_price,
    delivery_price: row.delivery_price,
    sale_date: row.sale_date,
    buyer_name: row.buyer_name || null,
    buyer_phone: row.buyer_phone || null,
    payment_status: row.payment_status,
    amount_received: row.amount_received,
    notes: row.notes || null,
  };

  let saved: Sale;
  if (existing) {
    const { data, error } = await db().from('sales').update(saleRow).eq('id', existing.id).select().single();
    if (error) throw error;
    saved = data as Sale;
  } else {
    const { data, error } = await db().from('sales').insert(saleRow).select().single();
    if (error) throw error;
    saved = data as Sale;
  }

  await db()
    .from('products')
    .update({ stock_qty: fresh.stock_qty - row.qty, updated_at: new Date().toISOString() })
    .eq('id', product.id);

  return saved;
}

export async function deleteSale(id: string): Promise<void> {
  if (DEMO) {
    const s = demoStore.sales.find((x) => x.id === id);
    if (s) {
      const p = demoStore.products.find((x) => x.id === s.product_id);
      if (p) p.stock_qty += s.qty;
      demoStore.sales = demoStore.sales.filter((x) => x.id !== id);
    }
    return;
  }
  const sale = await getSale(id);
  if (sale?.product_id) {
    const prod = await getProduct(sale.product_id);
    if (prod) {
      await db()
        .from('products')
        .update({ stock_qty: prod.stock_qty + sale.qty, updated_at: new Date().toISOString() })
        .eq('id', prod.id);
    }
  }
  const { error } = await db().from('sales').delete().eq('id', id);
  if (error) throw error;
}

/* ---------------- product photos ---------------- */

export async function uploadProductImage(userId: string, file: File): Promise<string | null> {
  if (DEMO) return null;
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await db().storage.from('product-images').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || 'image/jpeg',
  });
  if (error) throw error;
  const { data } = db().storage.from('product-images').getPublicUrl(path);
  return data.publicUrl;
}
