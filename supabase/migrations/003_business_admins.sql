-- Add slug column to businesses for URL routing
ALTER TABLE businesses ADD COLUMN slug TEXT UNIQUE;

-- Business admins table
CREATE TABLE business_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, user_id)
);

-- RLS for business_admins
ALTER TABLE business_admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read own admin records" ON business_admins
  FOR SELECT USING (auth.uid() = user_id);

-- Replace visits insert policy to allow business admins to record visits for customers
DROP POLICY IF EXISTS "Users can insert own visits" ON visits;

CREATE POLICY "Users or admins can insert visits" ON visits
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM business_admins
      WHERE business_admins.user_id = auth.uid()
      AND business_admins.business_id = visits.business_id
    )
  );

-- Replace users select policy to allow business admins to look up customers
DROP POLICY IF EXISTS "Users can read own record" ON users;

CREATE POLICY "Users can read own or admins can read all" ON users
  FOR SELECT USING (
    auth.uid() = id
    OR EXISTS (
        SELECT 1 FROM visits
        WHERE visits.user_id = users.id
        AND visits.business_id IN (
            SELECT business_id FROM business_admins
            WHERE user_id = auth.uid()
        )
    )
  );
