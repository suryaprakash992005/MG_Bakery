-- ========================================================
-- M.G. IYENGAR BAKERY & CHATS - ORDERS & PAYMENTS SCHEMA
-- ========================================================

-- 1. Create `orders` table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
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
    delivery_fee NUMERIC DEFAULT 40,
    subtotal NUMERIC NOT NULL DEFAULT 0,
    total_amount NUMERIC NOT NULL DEFAULT 0,
    payment_method TEXT NOT NULL DEFAULT 'razorpay',
    payment_status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'PAID', 'FAILED'
    order_status TEXT NOT NULL DEFAULT 'CONFIRMED', -- 'PENDING PAYMENT', 'PAID', 'CONFIRMED', 'PREPARING', 'READY', 'OUT FOR DELIVERY', 'DELIVERED', 'READY FOR PICKUP', 'PICKED UP', 'CANCELLED'
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create `order_items` table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC NOT NULL DEFAULT 0,
    total_price NUMERIC NOT NULL DEFAULT 0,
    selected_options JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS (Row Level Security) and allow public insert & select
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous order placement" ON public.orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public reading of orders" ON public.orders
    FOR SELECT USING (true);

CREATE POLICY "Allow public order updates" ON public.orders
    FOR UPDATE USING (true);

CREATE POLICY "Allow anonymous order item placement" ON public.order_items
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public reading of order items" ON public.order_items
    FOR SELECT USING (true);
