-- ============================================================================
-- M.G. IYENGAR BAKERY & CHATS — PRODUCTION ORDER & ADDRESS DATABASE MIGRATION
-- File: src/utils/bakery_order_database_migration.sql
-- ============================================================================
-- Purpose:
--   Safely creates the 3 missing tables (customer_addresses, orders, order_items)
--   and sequence required for customer order history and WhatsApp ordering.
--
-- Safety & Production Guarantees:
--   1. Strict Admin Identity: All admin RLS policies strictly check:
--        (auth.jwt() ->> 'email') = 'admin@mgiyengar.com'
--      No broad wildcard/substring matches (e.g. LIKE '%admin%').
--   2. Strict Customer Data Isolation:
--      - Customers can ONLY insert orders with user_id = auth.uid().
--      - Customers can ONLY select their own orders (user_id = auth.uid()).
--      - Customers can ONLY access order items belonging to their own orders.
--      - Customers can ONLY manage their own addresses and profile.
--   3. Preservation of Existing Tables:
--      - banners, customers, gallery, products, profiles, settings are NOT dropped or recreated.
--      - public.customers is completely untouched.
--      - profiles.full_name is respected (no rename to 'name').
--   4. Zero Operational / Tracking Bloat:
--      - No online payment gateways (no Razorpay, Stripe, webhooks).
--      - WhatsApp ordering is the standard payment_method ('whatsapp').
--      - No operational tracking workflows or status state-machines added.
--   5. Realtime Publication:
--      - Explicitly and safely inspects pg_publication before adding tables,
--        avoiding silent error suppression.
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 1. ORDER NUMBER SEQUENCE & GENERATOR
-- ────────────────────────────────────────────────────────────────────────────
-- Generates human-readable bakery order numbers (e.g., MG-001001)
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START WITH 1001 INCREMENT BY 1;

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
BEGIN
    RETURN 'MG-' || LPAD(nextval('public.order_number_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- ────────────────────────────────────────────────────────────────────────────
-- 2. CUSTOMER ADDRESSES TABLE
-- ────────────────────────────────────────────────────────────────────────────
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

-- Index for customer addresses lookup by user_id
CREATE INDEX IF NOT EXISTS idx_customer_addresses_user_id
    ON public.customer_addresses(user_id);

-- ────────────────────────────────────────────────────────────────────────────
-- 3. ORDERS TABLE
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL DEFAULT public.generate_order_number(),
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

-- Indexes for performant order lookups and admin sorting
CREATE INDEX IF NOT EXISTS idx_orders_user_id
    ON public.orders(user_id);

CREATE INDEX IF NOT EXISTS idx_orders_order_number
    ON public.orders(order_number);

CREATE INDEX IF NOT EXISTS idx_orders_created_at
    ON public.orders(created_at DESC);

-- ────────────────────────────────────────────────────────────────────────────
-- 4. ORDER ITEMS TABLE
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price NUMERIC NOT NULL DEFAULT 0,
    total_price NUMERIC NOT NULL DEFAULT 0,
    selected_weight TEXT DEFAULT 'Standard',
    customizations JSONB DEFAULT '{}'::jsonb,
    product_snapshot JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for order items lookup by parent order
CREATE INDEX IF NOT EXISTS idx_order_items_order_id
    ON public.order_items(order_id);

-- ────────────────────────────────────────────────────────────────────────────
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ────────────────────────────────────────────────────────────────────────────

-- ─── 5A. Customer Addresses RLS ───
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own addresses" ON public.customer_addresses;
CREATE POLICY "Users manage own addresses" ON public.customer_addresses
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ─── 5B. Orders RLS ───
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 1. Customer Insert: Customers can ONLY insert orders with their own user_id
DROP POLICY IF EXISTS "Customers insert own orders" ON public.orders;
CREATE POLICY "Customers insert own orders" ON public.orders
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- 2. Customer Select: Customers can ONLY read their own orders
DROP POLICY IF EXISTS "Customers read own orders" ON public.orders;
CREATE POLICY "Customers read own orders" ON public.orders
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- 3. Admin Select: Bakery administrator can view all incoming orders
--    Strict check: Exact email 'admin@mgiyengar.com' only.
DROP POLICY IF EXISTS "Admin read all orders" ON public.orders;
CREATE POLICY "Admin read all orders" ON public.orders
    FOR SELECT
    TO authenticated
    USING ((auth.jwt() ->> 'email') = 'admin@mgiyengar.com');

-- 4. Admin Update: Compatibility for existing Admin Orders status updates
--    Note: PostgreSQL RLS filters by row, not by individual column.
--    This policy permits the authenticated admin (admin@mgiyengar.com) to update orders.
--    The frontend calls updateOrderStatus/updateOrderPaymentStatus on this row.
DROP POLICY IF EXISTS "Admin update orders" ON public.orders;
CREATE POLICY "Admin update orders" ON public.orders
    FOR UPDATE
    TO authenticated
    USING ((auth.jwt() ->> 'email') = 'admin@mgiyengar.com')
    WITH CHECK ((auth.jwt() ->> 'email') = 'admin@mgiyengar.com');

-- ─── 5C. Order Items RLS ───
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 1. Customer Insert: Can only insert items linked to orders owned by the user
DROP POLICY IF EXISTS "Customers insert own order items" ON public.order_items;
CREATE POLICY "Customers insert own order items" ON public.order_items
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
              AND orders.user_id = auth.uid()
        )
    );

-- 2. Order Items Select: Accessible only by the order owner or the bakery admin
DROP POLICY IF EXISTS "Users read own order items" ON public.order_items;
CREATE POLICY "Users read own order items" ON public.order_items
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
              AND (
                  orders.user_id = auth.uid()
                  OR (auth.jwt() ->> 'email') = 'admin@mgiyengar.com'
              )
        )
    );

-- ─── 5D. Profiles RLS & Profile Statistics Protection ───
-- Ensures the Admin Customers page can read registered customer profiles
-- while customers can only edit their own profile.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow reading profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users and admins read profiles" ON public.profiles;

-- 1. Profiles Select: Users can read their own profile; admin reads all profiles
CREATE POLICY "Users and admins read profiles" ON public.profiles
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() = id
        OR (auth.jwt() ->> 'email') = 'admin@mgiyengar.com'
    );

-- 2. Profiles Insert: Authenticated users can insert their own profile on signup
DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users manage own profile" ON public.profiles;
CREATE POLICY "Users insert own profile" ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- 3. Profiles Update: Authenticated users can update their own profile row
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 4. Column-Level Protection for Customer Profile Statistics:
-- Note on PostgreSQL Architecture:
-- PostgreSQL Row Level Security (RLS) operates at the row level; it controls which rows
-- a user can modify, but cannot inspect or prohibit changes to individual columns
-- inside an allowed row.
-- To prevent customers from spoofing their own total_orders or total_spent columns,
-- the trigger below intercepts customer inserts and updates, guaranteeing that
-- total_orders and total_spent can never be modified by non-admin users.
CREATE OR REPLACE FUNCTION public.protect_profile_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF (auth.jwt() ->> 'email') IS DISTINCT FROM 'admin@mgiyengar.com' THEN
        IF TG_OP = 'INSERT' THEN
            NEW.total_orders = 0;
            NEW.total_spent  = 0;
        ELSIF TG_OP = 'UPDATE' THEN
            NEW.total_orders = COALESCE(OLD.total_orders, 0);
            NEW.total_spent  = COALESCE(OLD.total_spent, 0);
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

DROP TRIGGER IF EXISTS trg_protect_profile_stats ON public.profiles;
CREATE TRIGGER trg_protect_profile_stats
    BEFORE INSERT OR UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_profile_stats();

-- ────────────────────────────────────────────────────────────────────────────
-- 6. REALTIME REPLICATION CONFIGURATION
-- ────────────────────────────────────────────────────────────────────────────
-- Explicitly checks publication existence before adding tables, without suppressing errors
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables
            WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'orders'
        ) THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables
            WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'profiles'
        ) THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
        END IF;
    END IF;
END $$;
