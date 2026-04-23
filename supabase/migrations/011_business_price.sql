ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS monthly_price NUMERIC NOT NULL DEFAULT 300 CHECK (monthly_price > 0);
