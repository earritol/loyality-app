ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS monthly_price NUMERIC NOT NULL DEFAULT 300 CHECK (monthly_price > 0);

-- Allow 'online' as payment method
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_method_check;
ALTER TABLE payments ADD CONSTRAINT payments_method_check CHECK (method IN ('cash', 'transfer', 'online'));
