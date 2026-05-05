-- ============================================================
-- SHAJPORI — Migration 005: Customer Profiles & Addresses
-- ============================================================

-- ── Extend users table ───────────────────────────────────────
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS avatar_url     TEXT,
  ADD COLUMN IF NOT EXISTS date_of_birth  DATE,
  ADD COLUMN IF NOT EXISTS gender         TEXT CHECK (gender IN ('female','male','other','prefer_not_to_say')),
  ADD COLUMN IF NOT EXISTS bio            TEXT,
  ADD COLUMN IF NOT EXISTS updated_at     TIMESTAMPTZ DEFAULT NOW();

-- ── Customer Addresses ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.customer_addresses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  label         TEXT NOT NULL DEFAULT 'Home',
  full_name     TEXT NOT NULL,
  phone         TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city          TEXT NOT NULL,
  district      TEXT NOT NULL,
  postal_code   TEXT,
  is_default    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_addresses_user ON public.customer_addresses(user_id);

-- RLS: customers can only see/edit their own addresses
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own addresses" ON public.customer_addresses;
CREATE POLICY "Users manage own addresses" ON public.customer_addresses
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins read all addresses" ON public.customer_addresses;
CREATE POLICY "Admins read all addresses" ON public.customer_addresses
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','staff'))
  );

-- ── Update trigger to set role ────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'customer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── Ensure only one default address per user ──────────────────
CREATE OR REPLACE FUNCTION unset_other_defaults()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default THEN
    UPDATE public.customer_addresses
       SET is_default = FALSE
     WHERE user_id = NEW.user_id AND id <> NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_single_default_address ON public.customer_addresses;
CREATE TRIGGER trg_single_default_address
  AFTER INSERT OR UPDATE OF is_default ON public.customer_addresses
  FOR EACH ROW EXECUTE FUNCTION unset_other_defaults();
