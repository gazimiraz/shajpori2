-- ============================================================
-- SHAJPORI — Migration 001: Initial Schema
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ── ENUMS ─────────────────────────────────────────────────────
CREATE TYPE product_category     AS ENUM ('Dress','Bag','Accessory','Jewelry','Footwear');
CREATE TYPE order_status         AS ENUM ('Pending','Confirmed','Processing','Shipped','Delivered','Cancelled','Refunded');
CREATE TYPE payment_status_type  AS ENUM ('Unpaid','Paid','Refunded','Partially_Refunded');
CREATE TYPE stock_movement_type  AS ENUM ('purchase','sale','return','adjustment','damage');
CREATE TYPE finance_entry_type   AS ENUM ('revenue','expense','refund','adjustment');
CREATE TYPE user_role            AS ENUM ('customer','admin','staff');

-- ── USERS ─────────────────────────────────────────────────────
CREATE TABLE public.users (
  id               UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email            TEXT UNIQUE NOT NULL,
  full_name        TEXT,
  phone            TEXT,
  role             user_role NOT NULL DEFAULT 'customer',
  shipping_address JSONB,
  total_orders     INTEGER DEFAULT 0,
  total_spent      NUMERIC(12,2) DEFAULT 0,
  loyalty_points   INTEGER DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── PRODUCTS ──────────────────────────────────────────────────
CREATE TABLE public.products (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku               VARCHAR(50) UNIQUE NOT NULL,
  name              VARCHAR(255) NOT NULL,
  slug              VARCHAR(255) UNIQUE NOT NULL,
  description       TEXT,
  short_description TEXT,
  category          product_category NOT NULL,
  price             NUMERIC(10,2) NOT NULL,
  compare_at_price  NUMERIC(10,2),
  cost_price        NUMERIC(10,2),
  colors            TEXT[] DEFAULT '{}',
  available_sizes   TEXT[] DEFAULT '{}',
  materials         TEXT[] DEFAULT '{}',
  tags              TEXT[] DEFAULT '{}',
  image_urls        TEXT[] DEFAULT '{}',
  thumbnail_url     TEXT,
  track_inventory   BOOLEAN DEFAULT TRUE,
  total_stock       INTEGER DEFAULT 0,
  reserved_stock    INTEGER DEFAULT 0,
  low_stock_alert   INTEGER DEFAULT 5,
  badge             VARCHAR(50),
  is_active         BOOLEAN DEFAULT TRUE,
  is_featured       BOOLEAN DEFAULT FALSE,
  total_sold        INTEGER DEFAULT 0,
  total_revenue     NUMERIC(12,2) DEFAULT 0,
  view_count        INTEGER DEFAULT 0,
  rating_avg        NUMERIC(3,2) DEFAULT 0,
  rating_count      INTEGER DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_slug     ON public.products(slug);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_active   ON public.products(is_active);
CREATE INDEX idx_products_featured ON public.products(is_featured);

-- ── PRODUCT VARIANTS ──────────────────────────────────────────
CREATE TABLE public.product_variants (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id     UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sku            VARCHAR(100) UNIQUE NOT NULL,
  size           VARCHAR(20),
  color          VARCHAR(100),
  color_hex      VARCHAR(7),
  stock_quantity INTEGER DEFAULT 0,
  reserved_qty   INTEGER DEFAULT 0,
  price_modifier NUMERIC(8,2) DEFAULT 0,
  is_active      BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_variants_product ON public.product_variants(product_id);

-- ── ORDERS ───────────────────────────────────────────────────
CREATE TABLE public.orders (
  order_id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number     VARCHAR(30) UNIQUE,
  user_id          UUID REFERENCES public.users(id) ON DELETE SET NULL,
  guest_email      TEXT,
  items_ordered    JSONB NOT NULL DEFAULT '[]',
  subtotal         NUMERIC(12,2) NOT NULL,
  delivery_charge  NUMERIC(8,2) DEFAULT 0,
  discount_amount  NUMERIC(10,2) DEFAULT 0,
  tax_amount       NUMERIC(10,2) DEFAULT 0,
  total_amount     NUMERIC(12,2) NOT NULL,
  payment_status   payment_status_type DEFAULT 'Unpaid',
  payment_method   VARCHAR(50),
  stripe_session_id TEXT,
  status           order_status DEFAULT 'Pending',
  shipping_address JSONB,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_user    ON public.orders(user_id);
CREATE INDEX idx_orders_status  ON public.orders(status);
CREATE INDEX idx_orders_created ON public.orders(created_at DESC);

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  year_str TEXT := TO_CHAR(NOW(), 'YYYY');
  seq_num  INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 10) AS INTEGER)), 0) + 1
  INTO seq_num FROM public.orders
  WHERE order_number LIKE 'SJP-' || year_str || '-%';
  NEW.order_number := 'SJP-' || year_str || '-' || LPAD(seq_num::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION generate_order_number();

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_orders_updated_at   BEFORE UPDATE ON public.orders   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── STOCK MOVEMENTS ──────────────────────────────────────────
CREATE TABLE public.stock_movements (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id      UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id      UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  movement_type   stock_movement_type NOT NULL,
  quantity        INTEGER NOT NULL,
  quantity_before INTEGER NOT NULL,
  quantity_after  INTEGER NOT NULL,
  reference_id    UUID,
  reference_type  VARCHAR(50),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_movements_product ON public.stock_movements(product_id);
CREATE INDEX idx_movements_created ON public.stock_movements(created_at DESC);

-- ── FINANCE LEDGER ───────────────────────────────────────────
CREATE TABLE public.finance_ledger (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entry_type     finance_entry_type NOT NULL,
  category       VARCHAR(100) NOT NULL,
  description    TEXT NOT NULL,
  amount         NUMERIC(12,2) NOT NULL,
  payment_method VARCHAR(50),
  entry_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  reference_id   UUID,
  reference_type VARCHAR(50),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_finance_date ON public.finance_ledger(entry_date DESC);
CREATE INDEX idx_finance_type ON public.finance_ledger(entry_type);

-- ── TRIGGER: deduct stock + log finance on order confirmed ────
CREATE OR REPLACE FUNCTION on_order_confirmed()
RETURNS TRIGGER AS $$
DECLARE
  item     JSONB;
  v_stock  INTEGER;
BEGIN
  IF NEW.status = 'Confirmed' AND OLD.status = 'Pending' THEN
    FOR item IN SELECT * FROM jsonb_array_elements(NEW.items_ordered) LOOP
      IF (item->>'variant_id') IS NOT NULL THEN
        SELECT stock_quantity INTO v_stock
          FROM public.product_variants WHERE id = (item->>'variant_id')::UUID;
        IF FOUND THEN
          UPDATE public.product_variants
            SET stock_quantity = stock_quantity - (item->>'qty')::INTEGER
          WHERE id = (item->>'variant_id')::UUID;
          INSERT INTO public.stock_movements
            (product_id, variant_id, movement_type, quantity, quantity_before, quantity_after, reference_id, reference_type)
          VALUES
            ((item->>'product_id')::UUID, (item->>'variant_id')::UUID, 'sale',
             -(item->>'qty')::INTEGER, v_stock, v_stock - (item->>'qty')::INTEGER,
             NEW.order_id, 'order');
        END IF;
      END IF;
    END LOOP;
    INSERT INTO public.finance_ledger
      (entry_type, category, description, amount, payment_method, reference_id, reference_type)
    VALUES
      ('revenue', 'Sales', 'Order ' || NEW.order_number,
       NEW.total_amount, NEW.payment_method, NEW.order_id, 'order');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_confirmed
  AFTER UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION on_order_confirmed();

-- ── ANALYTICS VIEWS ──────────────────────────────────────────

CREATE OR REPLACE VIEW v_daily_sales AS
SELECT
  DATE(created_at)    AS sale_date,
  COUNT(*)            AS total_orders,
  SUM(total_amount)   AS total_revenue,
  AVG(total_amount)   AS avg_order_value
FROM public.orders
WHERE status NOT IN ('Cancelled','Refunded')
GROUP BY DATE(created_at)
ORDER BY sale_date DESC;

CREATE OR REPLACE VIEW v_product_performance AS
SELECT
  p.id, p.name, p.sku, p.category, p.price,
  p.total_sold, p.total_revenue, p.total_stock,
  p.view_count, p.rating_avg,
  (p.total_stock <= p.low_stock_alert) AS is_low_stock
FROM public.products p WHERE p.is_active = TRUE;

CREATE OR REPLACE VIEW v_size_wise_sales AS
SELECT
  v.size,
  SUM(sm.quantity * -1)          AS total_sold,
  COUNT(DISTINCT sm.reference_id) AS order_count
FROM public.stock_movements sm
JOIN public.product_variants v ON v.id = sm.variant_id
WHERE sm.movement_type = 'sale' AND v.size IS NOT NULL
GROUP BY v.size ORDER BY total_sold DESC;

CREATE OR REPLACE VIEW v_color_wise_sales AS
SELECT
  v.color, v.color_hex,
  SUM(sm.quantity * -1)          AS total_sold,
  COUNT(DISTINCT sm.reference_id) AS order_count
FROM public.stock_movements sm
JOIN public.product_variants v ON v.id = sm.variant_id
WHERE sm.movement_type = 'sale' AND v.color IS NOT NULL
GROUP BY v.color, v.color_hex ORDER BY total_sold DESC;

CREATE OR REPLACE VIEW v_stock_alerts AS
SELECT
  p.id AS product_id, p.name AS product_name, p.sku AS product_sku,
  p.category, p.low_stock_alert,
  v.id AS variant_id, v.sku AS variant_sku, v.size, v.color, v.stock_quantity
FROM public.products p
JOIN public.product_variants v ON v.product_id = p.id
WHERE v.stock_quantity <= p.low_stock_alert
  AND v.is_active = TRUE AND p.is_active = TRUE
ORDER BY v.stock_quantity ASC;

CREATE OR REPLACE VIEW v_monthly_finance AS
SELECT
  TO_CHAR(entry_date, 'YYYY-MM') AS month,
  SUM(CASE WHEN entry_type='revenue' THEN amount ELSE 0 END) AS revenue,
  SUM(CASE WHEN entry_type='expense' THEN amount ELSE 0 END) AS expenses,
  SUM(CASE WHEN entry_type='refund'  THEN amount ELSE 0 END) AS refunds,
  SUM(CASE WHEN entry_type='revenue' THEN amount ELSE 0 END)
    - SUM(CASE WHEN entry_type='expense' THEN amount ELSE 0 END)
    - SUM(CASE WHEN entry_type='refund'  THEN amount ELSE 0 END) AS net_profit
FROM public.finance_ledger
GROUP BY TO_CHAR(entry_date, 'YYYY-MM')
ORDER BY month DESC;

-- ── ROW LEVEL SECURITY ───────────────────────────────────────
ALTER TABLE public.users            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_ledger   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_self"          ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_admin"         ON public.users FOR ALL    USING (EXISTS(SELECT 1 FROM public.users WHERE id=auth.uid() AND role IN ('admin','staff')));
CREATE POLICY "products_public"     ON public.products FOR SELECT USING (is_active = TRUE);
CREATE POLICY "products_admin"      ON public.products FOR ALL    USING (EXISTS(SELECT 1 FROM public.users WHERE id=auth.uid() AND role IN ('admin','staff')));
CREATE POLICY "variants_public"     ON public.product_variants FOR SELECT USING (TRUE);
CREATE POLICY "variants_admin"      ON public.product_variants FOR ALL    USING (EXISTS(SELECT 1 FROM public.users WHERE id=auth.uid() AND role IN ('admin','staff')));
CREATE POLICY "orders_own"          ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "orders_admin"        ON public.orders FOR ALL    USING (EXISTS(SELECT 1 FROM public.users WHERE id=auth.uid() AND role IN ('admin','staff')));
CREATE POLICY "orders_insert"       ON public.orders FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "stock_admin"         ON public.stock_movements FOR ALL USING (EXISTS(SELECT 1 FROM public.users WHERE id=auth.uid() AND role IN ('admin','staff')));
CREATE POLICY "finance_admin"       ON public.finance_ledger  FOR ALL USING (EXISTS(SELECT 1 FROM public.users WHERE id=auth.uid() AND role IN ('admin','staff')));
