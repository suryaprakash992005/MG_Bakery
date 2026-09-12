-- ========================================================
-- M.G. IYENGAR BAKERY & CHATS - SIMPLIFIED SUPABASE SCHEMA
-- Run this in the Supabase SQL Editor: Dashboard -> SQL Editor -> New query -> Run
-- ========================================================

-- 1. Create `orders` table (clean historical transaction records)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    order_type TEXT NOT NULL DEFAULT 'delivery', -- 'delivery' or 'pickup'
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

-- Ensure user_id and columns exist if table was already created earlier
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS whatsapp_opened_at TIMESTAMPTZ;

-- 2. Create `order_items` table (preserves price & customization snapshot)
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

-- 3. Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow order insert" ON public.orders;
CREATE POLICY "Allow order insert" ON public.orders
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow reading orders" ON public.orders;
CREATE POLICY "Allow reading orders" ON public.orders
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow order updates" ON public.orders;
CREATE POLICY "Allow order updates" ON public.orders
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow order items insert" ON public.order_items;
CREATE POLICY "Allow order items insert" ON public.order_items
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow reading order items" ON public.order_items;
CREATE POLICY "Allow reading order items" ON public.order_items
    FOR SELECT USING (true);
