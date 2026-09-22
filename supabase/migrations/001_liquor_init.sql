-- StockSell (liquor sales) schema
-- Tables live in the same Supabase project as the lending app.

-- ---------------------------------------------------------------- products
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  brand text,
  category text not null default 'whisky'
    check (category in ('whisky','vodka','gin','rum','tequila','wine','beer','brandy','liqueur','champagne','other')),
  size_ml integer check (size_ml is null or size_ml > 0),
  abv numeric check (abv is null or (abv >= 0 and abv <= 100)),
  procurement_price numeric not null default 0 check (procurement_price >= 0),
  sell_price numeric not null default 0 check (sell_price >= 0),
  stock_qty integer not null default 0 check (stock_qty >= 0),
  low_stock_at integer not null default 3 check (low_stock_at >= 0),
  image_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_user_id_idx on public.products (user_id);

alter table public.products enable row level security;

drop policy if exists "products_all_own" on public.products;
create policy "products_all_own"
  on public.products for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ------------------------------------------------------------------- sales
create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_name text not null,
  qty integer not null check (qty > 0),
  procurement_price numeric not null check (procurement_price >= 0),
  sell_price numeric not null check (sell_price >= 0),
  delivery_price numeric not null check (delivery_price >= 0),
  sale_date date not null default (current_date),
  buyer_name text,
  buyer_phone text,
  payment_status text not null default 'paid'
    check (payment_status in ('paid', 'pending')),
  amount_received numeric not null default 0 check (amount_received >= 0),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists sales_user_id_idx on public.sales (user_id);
create index if not exists sales_date_idx on public.sales (user_id, sale_date desc);
create index if not exists sales_product_idx on public.sales (product_id);

alter table public.sales enable row level security;

drop policy if exists "sales_all_own" on public.sales;
create policy "sales_all_own"
  on public.sales for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ------------------------------------------------- product photo storage
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "product_images_public_read" on storage.objects;
create policy "product_images_public_read"
  on storage.objects for select
  using (bucket_id = 'product-images');

drop policy if exists "product_images_auth_insert" on storage.objects;
create policy "product_images_auth_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "product_images_auth_update" on storage.objects;
create policy "product_images_auth_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "product_images_auth_delete" on storage.objects;
create policy "product_images_auth_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
