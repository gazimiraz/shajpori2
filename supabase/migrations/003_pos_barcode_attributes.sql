-- ============================================================
-- SHAJPORI — Migration 003: POS, Barcodes, Attributes
-- ============================================================

-- ── BRANDS ───────────────────────────────────────────────────
CREATE TABLE public.brands (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(100) UNIQUE NOT NULL,
  slug        VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  logo_url    TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.brands (name, slug) VALUES
  ('Shajpori', 'shajpori'),
  ('DhakaStyle', 'dhakastyle'),
  ('Gulshan Label', 'gulshan-label');

-- ── UNITS ────────────────────────────────────────────────────
CREATE TABLE public.units (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       VARCHAR(50) UNIQUE NOT NULL,  -- Piece, Pair, Set, Pack
  short_name VARCHAR(10),                   -- pcs, pr, set
  is_active  BOOLEAN DEFAULT TRUE
);

INSERT INTO public.units (name, short_name) VALUES
  ('Piece','pcs'), ('Pair','pr'), ('Set','set'),
  ('Pack','pk'), ('Box','box'), ('Dozen','dz');

-- ── ATTRIBUTES (dynamic key-value catalogue) ─────────────────
CREATE TABLE public.attribute_groups (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       VARCHAR(100) UNIQUE NOT NULL,  -- e.g. "Colour", "Material"
  slug       VARCHAR(100) UNIQUE NOT NULL,
  type       VARCHAR(20) DEFAULT 'select'   -- select, multiselect, text, number, boolean
             CHECK (type IN ('select','multiselect','text','number','boolean','color')),
  is_variant BOOLEAN DEFAULT FALSE,         -- TRUE = creates product variants
  sort_order INTEGER DEFAULT 0,
  is_active  BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.attribute_values (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id     UUID NOT NULL REFERENCES public.attribute_groups(id) ON DELETE CASCADE,
  value        VARCHAR(100) NOT NULL,
  hex_code     VARCHAR(7),                  -- for colour attributes
  sort_order   INTEGER DEFAULT 0,
  is_active    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (group_id, value)
);

-- Seed attribute groups
INSERT INTO public.attribute_groups (name, slug, is_variant, sort_order) VALUES
  ('Colour',   'colour',   TRUE,  1),
  ('Size',     'size',     TRUE,  2),
  ('Material', 'material', FALSE, 3),
  ('Style',    'style',    FALSE, 4),
  ('Occasion', 'occasion', FALSE, 5),
  ('Season',   'season',   FALSE, 6);

-- Seed colours
INSERT INTO public.attribute_values (group_id, value, hex_code) 
SELECT id, v.value, v.hex FROM public.attribute_groups g,
(VALUES 
  ('Blush Pink','#FFB6C1'), ('Bubblegum Pink','#FF69B4'), ('Sage Green','#B2C9AD'),
  ('Sky Blue','#87CEEB'), ('Coral Orange','#FF7F50'), ('Deep Burgundy','#800020'),
  ('Ivory White','#FFFFF0'), ('Black Onyx','#0A0A0A'), ('Cream','#FFFDD0'),
  ('Dusty Rose','#DCAE96'), ('Cobalt Blue','#0047AB'), ('Cotton Candy Pink','#FFB7D5'),
  ('Lavender Mist','#C4A8E1'), ('Butter Yellow','#FFFACD'), ('Mint Green','#98FF98'),
  ('Rose Gold','#B76E79'), ('Silver','#C0C0C0'), ('Gold','#FFD700')
) AS v(value, hex)
WHERE g.slug = 'colour';

-- Seed sizes
INSERT INTO public.attribute_values (group_id, value, sort_order)
SELECT id, v.value, v.sort FROM public.attribute_groups g,
(VALUES ('XS',1),('S',2),('M',3),('L',4),('XL',5),('XXL',6),('One Size',7)) AS v(value, sort)
WHERE g.slug = 'size';

-- ── BARCODE REGISTRY ─────────────────────────────────────────
CREATE TABLE public.barcodes (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barcode_value VARCHAR(50) UNIQUE NOT NULL,
  barcode_type  VARCHAR(20) NOT NULL DEFAULT 'EAN13'
                CHECK (barcode_type IN ('EAN13','CODE128','QR','UPC','ITF14')),
  product_id    UUID REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id    UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  is_active     BOOLEAN DEFAULT TRUE,
  printed_count INTEGER DEFAULT 0,
  last_printed  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_barcodes_value    ON public.barcodes(barcode_value);
CREATE INDEX idx_barcodes_product  ON public.barcodes(product_id);
CREATE INDEX idx_barcodes_variant  ON public.barcodes(variant_id);

-- ── BARCODE PRINT LOG ─────────────────────────────────────────
CREATE TABLE public.barcode_print_log (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barcode_id   UUID NOT NULL REFERENCES public.barcodes(id),
  copies       INTEGER DEFAULT 1,
  label_size   VARCHAR(30),
  printed_by   UUID REFERENCES public.users(id),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── POS SESSIONS ─────────────────────────────────────────────
CREATE TABLE public.pos_sessions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_number VARCHAR(30) UNIQUE NOT NULL,
  cashier_id    UUID REFERENCES public.users(id),
  terminal_name VARCHAR(50) DEFAULT 'Main POS',
  opened_at     TIMESTAMPTZ DEFAULT NOW(),
  closed_at     TIMESTAMPTZ,
  opening_cash  NUMERIC(12,2) DEFAULT 0,
  closing_cash  NUMERIC(12,2),
  total_sales   NUMERIC(12,2) DEFAULT 0,
  total_orders  INTEGER DEFAULT 0,
  status        VARCHAR(20) DEFAULT 'Open' CHECK (status IN ('Open','Closed'))
);

-- ── POS SALES (separate from online orders) ──────────────────
CREATE TABLE public.pos_sales (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_number    VARCHAR(30) UNIQUE NOT NULL,
  session_id     UUID REFERENCES public.pos_sessions(id),
  cashier_id     UUID REFERENCES public.users(id),
  customer_name  VARCHAR(255),
  customer_phone VARCHAR(20),
  items          JSONB NOT NULL DEFAULT '[]',
  -- [{product_id, variant_id, name, sku, barcode, size, colour, qty, unit_price, discount_pct, total_price}]
  subtotal       NUMERIC(12,2) NOT NULL,
  discount_pct   NUMERIC(5,2) DEFAULT 0,
  discount_amt   NUMERIC(10,2) DEFAULT 0,
  delivery_charge NUMERIC(8,2) DEFAULT 0,
  tax_amount     NUMERIC(10,2) DEFAULT 0,
  total_amount   NUMERIC(12,2) NOT NULL,
  payment_method VARCHAR(30) NOT NULL DEFAULT 'cash'
                 CHECK (payment_method IN ('cash','card','bkash','nagad','cod','split')),
  amount_tendered NUMERIC(12,2),
  change_given   NUMERIC(10,2),
  notes          TEXT,
  is_returned    BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pos_sales_created ON public.pos_sales(created_at DESC);
CREATE INDEX idx_pos_sales_session ON public.pos_sales(session_id);

-- ── PRODUCT ADDITIONS (extend existing products table) ────────
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS brand_id       UUID REFERENCES public.brands(id),
  ADD COLUMN IF NOT EXISTS unit_id        UUID REFERENCES public.units(id),
  ADD COLUMN IF NOT EXISTS unit_name      VARCHAR(50) DEFAULT 'Piece',
  ADD COLUMN IF NOT EXISTS barcode        VARCHAR(50),
  ADD COLUMN IF NOT EXISTS barcode_type   VARCHAR(20) DEFAULT 'EAN13',
  ADD COLUMN IF NOT EXISTS status         VARCHAR(20) DEFAULT 'active'
                                          CHECK (status IN ('active','draft','archived')),
  ADD COLUMN IF NOT EXISTS weight_grams   INTEGER,
  ADD COLUMN IF NOT EXISTS dimensions     JSONB DEFAULT '{}',  -- {l,w,h}
  ADD COLUMN IF NOT EXISTS published_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sort_order     INTEGER DEFAULT 0;

ALTER TABLE public.product_variants
  ADD COLUMN IF NOT EXISTS barcode        VARCHAR(50) UNIQUE,
  ADD COLUMN IF NOT EXISTS weight_grams   INTEGER,
  ADD COLUMN IF NOT EXISTS location       VARCHAR(100);  -- shelf/bin location

-- ── POS DAILY SUMMARY VIEW ───────────────────────────────────
CREATE OR REPLACE VIEW v_pos_daily_summary AS
SELECT
  DATE(created_at) AS sale_date,
  COUNT(*) AS total_transactions,
  SUM(total_amount) AS total_revenue,
  SUM(subtotal) AS product_revenue,
  SUM(discount_amt) AS total_discounts,
  AVG(total_amount) AS avg_transaction,
  SUM(CASE WHEN payment_method='cash'  THEN total_amount ELSE 0 END) AS cash_revenue,
  SUM(CASE WHEN payment_method='card'  THEN total_amount ELSE 0 END) AS card_revenue,
  SUM(CASE WHEN payment_method='bkash' THEN total_amount ELSE 0 END) AS bkash_revenue,
  SUM(CASE WHEN payment_method='nagad' THEN total_amount ELSE 0 END) AS nagad_revenue
FROM public.pos_sales
WHERE is_returned = FALSE
GROUP BY DATE(created_at)
ORDER BY sale_date DESC;

-- ── AUTO-GENERATE POS SALE NUMBER ────────────────────────────
CREATE OR REPLACE FUNCTION generate_pos_sale_number()
RETURNS TRIGGER AS $$
DECLARE
  year_str TEXT := TO_CHAR(NOW(), 'YYYY');
  seq_num  INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(sale_number FROM 11) AS INTEGER)), 0) + 1
  INTO seq_num
  FROM public.pos_sales
  WHERE sale_number LIKE 'SJP-POS-' || year_str || '-%';
  NEW.sale_number := 'SJP-POS-' || year_str || '-' || LPAD(seq_num::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_pos_sale_number
BEFORE INSERT ON public.pos_sales
FOR EACH ROW EXECUTE FUNCTION generate_pos_sale_number();

-- ── RLS FOR NEW TABLES ────────────────────────────────────────
ALTER TABLE public.pos_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_sales    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barcodes     ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pos_sessions_admin" ON public.pos_sessions FOR ALL
  USING (EXISTS(SELECT 1 FROM public.users WHERE id=auth.uid() AND role IN ('admin','staff')));

CREATE POLICY "pos_sales_admin" ON public.pos_sales FOR ALL
  USING (EXISTS(SELECT 1 FROM public.users WHERE id=auth.uid() AND role IN ('admin','staff')));

CREATE POLICY "barcodes_public_read" ON public.barcodes FOR SELECT USING (TRUE);
CREATE POLICY "barcodes_admin_write" ON public.barcodes FOR ALL
  USING (EXISTS(SELECT 1 FROM public.users WHERE id=auth.uid() AND role IN ('admin','staff')));
