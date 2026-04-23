-- =============================================================================
-- 009: Backoffice Billing — business status, payments, platform admin
-- =============================================================================

-- 1. Billing columns on businesses
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'past_due', 'suspended')),
  ADD COLUMN IF NOT EXISTS billing_cutoff_day INTEGER
    CHECK (billing_cutoff_day IS NULL OR (billing_cutoff_day >= 1 AND billing_cutoff_day <= 31)),
  ADD COLUMN IF NOT EXISTS last_payment_date DATE;

-- Ensure UNIQUE constraint on slug
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'businesses_slug_unique'
  ) THEN
    ALTER TABLE businesses ADD CONSTRAINT businesses_slug_unique UNIQUE (slug);
  END IF;
END $$;

-- 2. Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  payment_date DATE NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('cash', 'transfer')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_business_id ON payments(business_id);

-- 3. Platform admin field on users
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_platform_admin BOOLEAN NOT NULL DEFAULT false;

-- 4. SQL helper function for RLS
CREATE OR REPLACE FUNCTION is_platform_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (SELECT is_platform_admin FROM users WHERE id = auth.uid()),
    false
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 5. RLS policies for platform admins

-- Businesses: platform admins can update any business
CREATE POLICY "Platform admins can update any business" ON businesses
  FOR UPDATE USING (is_platform_admin()) WITH CHECK (is_platform_admin());

-- Businesses: platform admins can insert businesses
CREATE POLICY "Platform admins can insert businesses" ON businesses
  FOR INSERT WITH CHECK (is_platform_admin());

-- Payments: enable RLS + platform admin policies
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform admins can read payments" ON payments
  FOR SELECT USING (is_platform_admin());

CREATE POLICY "Platform admins can insert payments" ON payments
  FOR INSERT WITH CHECK (is_platform_admin());

-- Users: platform admins can read all users
CREATE POLICY "Platform admins can read all users" ON users
  FOR SELECT USING (is_platform_admin());

-- Users: platform admins can insert users
CREATE POLICY "Platform admins can insert users" ON users
  FOR INSERT WITH CHECK (is_platform_admin());

-- Business admins: platform admins can insert
CREATE POLICY "Platform admins can insert business_admins" ON business_admins
  FOR INSERT WITH CHECK (is_platform_admin());

-- Business admins: platform admins can read all
CREATE POLICY "Platform admins can read all business_admins" ON business_admins
  FOR SELECT USING (is_platform_admin());
