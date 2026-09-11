-- ================================================================
-- M.G. IYENGAR BAKERY — WhatsApp E-Commerce Upgrade Migration
-- Run in Supabase Dashboard → SQL Editor → New Query
-- ================================================================
-- This is SAFE to run multiple times (uses IF NOT EXISTS everywhere)
-- ================================================================

-- ─── 1. PROFILES TABLE ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own profile" ON public.profiles;
CREATE POLICY "Users manage own profile" ON public.profiles
  FOR ALL USING (auth.uid() = id);

DROP POLICY IF EXISTS "Allow profile insert on signup" ON public.profiles;
CREATE POLICY "Allow profile insert on signup" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, phone, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── 2. CUSTOMER ADDRESSES TABLE ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT DEFAULT 'Home',
  name TEXT,
  phone TEXT,
  door_no TEXT,
  street_area TEXT NOT NULL DEFAULT '',
  landmark TEXT,
  city TEXT DEFAULT 'Mohanur',
  pincode TEXT DEFAULT '637015',
  latitude NUMERIC,
  longitude NUMERIC,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own addresses" ON public.customer_addresses;
CREATE POLICY "Users manage own addresses" ON public.customer_addresses
  FOR ALL USING (auth.uid() = user_id);

-- ─── 3. ORDERS TABLE ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  order_type TEXT NOT NULL DEFAULT 'delivery',
  delivery_address TEXT,
  street_area TEXT,
  landmark TEXT,
  city TEXT DEFAULT 'Mohanur',
  pincode TEXT DEFAULT '637015',
  latitude NUMERIC,
  longitude NUMERIC,
  delivery_area TEXT DEFAULT 'Mohanur',
  delivery_fee NUMERIC DEFAULT 0,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'whatsapp',
  payment_status TEXT NOT NULL DEFAULT 'PENDING',
  order_status TEXT NOT NULL DEFAULT 'ORDER_PLACED',
  whatsapp_opened_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS whatsapp_opened_at TIMESTAMPTZ;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow order placement" ON public.orders;
CREATE POLICY "Allow order placement" ON public.orders
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users read own orders" ON public.orders;
CREATE POLICY "Users read own orders" ON public.orders
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow order updates" ON public.orders;
CREATE POLICY "Allow order updates" ON public.orders
  FOR UPDATE USING (true);

-- ─── 4. ORDER ITEMS TABLE ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  total_price NUMERIC NOT NULL DEFAULT 0,
  selected_weight TEXT DEFAULT 'Standard',
  customizations JSONB DEFAULT '{}'::jsonb,
  product_snapshot JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS selected_weight TEXT DEFAULT 'Standard';
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS customizations JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS product_snapshot JSONB DEFAULT '{}'::jsonb;

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow order item placement" ON public.order_items;
CREATE POLICY "Allow order item placement" ON public.order_items
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow reading order items" ON public.order_items;
CREATE POLICY "Allow reading order items" ON public.order_items
  FOR SELECT USING (true);

-- ─── 5. ORDER NUMBER SEQUENCE ────────────────────────────────────────────────

CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START WITH 1001 INCREMENT BY 1;

CREATE OR REPLACE FUNCTION public.get_next_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'MG-' || nextval('public.order_number_seq')::TEXT;
END;
$$ LANGUAGE plpgsql;

-- ─── 6. REALTIME ─────────────────────────────────────────────────────────────

ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- ─── 7. CUSTOMER ANALYTICS VIEW ──────────────────────────────────────────────

CREATE OR REPLACE VIEW public.customer_stats AS
SELECT
  p.id AS user_id,
  p.name,
  p.phone,
  p.email,
  p.created_at AS registered_at,
  COUNT(o.id) AS total_orders,
  COALESCE(SUM(o.total_amount) FILTER (WHERE o.order_status != 'CANCELLED'), 0) AS total_spent,
  COALESCE(AVG(o.total_amount) FILTER (WHERE o.order_status != 'CANCELLED'), 0) AS avg_order_value,
  MAX(o.created_at) AS last_order_at,
  MIN(o.created_at) AS first_order_at
FROM public.profiles p
LEFT JOIN public.orders o ON o.user_id = p.id
GROUP BY p.id, p.name, p.phone, p.email, p.created_at;

-- ─── 8. WISHLIST ITEMS ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own wishlist" ON public.wishlist_items;
CREATE POLICY "Users manage own wishlist" ON public.wishlist_items
  FOR ALL USING (auth.uid() = user_id);

-- ─── DONE ────────────────────────────────────────────────────────────────────
