-- MercadoPago integration columns
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT,
  ADD COLUMN IF NOT EXISTS billing_mode TEXT DEFAULT 'manual' CHECK (billing_mode IN ('manual', 'subscription'));
