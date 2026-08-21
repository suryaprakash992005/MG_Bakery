-- ================================================================
-- M.G. Iyengar Bakery — E-Commerce Upgrade Migration
-- Run these in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ================================================================

-- ─── 1. Extend Products Table ─────────────────────────────────────────────────
-- Add columns needed for the advanced product detail page and filtering

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_eggless BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_best_seller BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS badge TEXT DEFAULT 'None',
  ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS rating_average NUMERIC(3,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rating_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS customizations JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS frequently_bought_with JSONB DEFAULT '[]'::jsonb;

-- ─── 2. Product Reviews ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  image_url TEXT,
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  is_hidden BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public review insert" ON public.product_reviews
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public review select" ON public.product_reviews
  FOR SELECT USING (is_hidden = FALSE);

-- Auto-update product rating_average and rating_count via trigger
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.products
  SET
    rating_average = (
      SELECT COALESCE(AVG(rating), 0)
      FROM public.product_reviews
      WHERE product_id = NEW.product_id AND is_hidden = FALSE
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM public.product_reviews
      WHERE product_id = NEW.product_id AND is_hidden = FALSE
    )
  WHERE id::TEXT = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_product_rating ON public.product_reviews;
CREATE TRIGGER trg_update_product_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.product_reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- ─── 3. Coupons Table ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  title TEXT,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL,
  min_order_amount NUMERIC DEFAULT 0,
  max_discount_amount NUMERIC,              -- Cap on percentage discounts
  usage_limit INT,                           -- NULL = unlimited
  used_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  start_date DATE,
  expiry_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon coupon read" ON public.coupons
  FOR SELECT USING (is_active = TRUE AND (expiry_date IS NULL OR expiry_date >= CURRENT_DATE));

-- ─── 4. Wishlist Items ─────────────────────────────────────────────────────────
-- For logged-in user sync. Guests use localStorage.

CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,                            -- For guest users
  product_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own wishlist" ON public.wishlist_items
  FOR ALL USING (auth.uid() = user_id);

-- ─── 5. Notify Me (Out of Stock) ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.notify_me (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL,
  product_name TEXT,
  customer_name TEXT,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  is_notified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notify_me ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous notify insert" ON public.notify_me
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin notify select" ON public.notify_me
  FOR SELECT USING (true);

-- ─── 6. Customer Addresses ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT DEFAULT 'Home',               -- 'Home', 'Work', 'Other'
  name TEXT,
  phone TEXT,
  address TEXT NOT NULL,
  street_area TEXT,
  city TEXT DEFAULT 'Mohanur',
  pincode TEXT DEFAULT '637015',
  latitude NUMERIC,
  longitude NUMERIC,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own addresses" ON public.customer_addresses
  FOR ALL USING (auth.uid() = user_id);

-- ─── 7. Admin: Notify Me RLS Update (allow admin read) ───────────────────────
-- Admin dashboard reads notify_me with service key — no additional policy needed.
-- Product reviews admin can use UPDATE to set is_hidden = TRUE:

CREATE POLICY "Admin can update reviews" ON public.product_reviews
  FOR UPDATE USING (true);

-- ─── Done ─────────────────────────────────────────────────────────────────────
-- Run this SQL in your Supabase project's SQL Editor.
-- After running, go to Authentication → Providers to enable Email auth.
