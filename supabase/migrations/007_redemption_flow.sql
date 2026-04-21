-- =============================================================================
-- 007: Redemption Flow — columns, backfill, indexes, RLS, atomic function
-- Execution order is critical. Do NOT reorder.
-- =============================================================================

-- 1. Add new columns (nullable initially for safe backfill)
ALTER TABLE redemptions
  ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS visits_used INTEGER CHECK (visits_used > 0),
  ADD COLUMN IF NOT EXISTS redeemed_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- 2. Backfill business_id from rewards for existing records
UPDATE redemptions r
SET business_id = rw.business_id
FROM rewards rw
WHERE r.reward_id = rw.id
AND r.business_id IS NULL;

-- Backfill visits_used from rewards.required_visits for existing records
UPDATE redemptions r
SET visits_used = rw.required_visits
FROM rewards rw
WHERE r.reward_id = rw.id
AND r.visits_used IS NULL;

-- 3. Apply NOT NULL constraints after backfill
ALTER TABLE redemptions
  ALTER COLUMN business_id SET NOT NULL,
  ALTER COLUMN visits_used SET NOT NULL;

-- 4. Create indexes
CREATE INDEX IF NOT EXISTS idx_redemptions_user_business
  ON redemptions(user_id, business_id);

CREATE INDEX IF NOT EXISTS idx_visits_business_created
  ON visits(business_id, created_at DESC);

-- 5. RLS policies

-- Redemptions SELECT: user can read own, admin can read for their business
DROP POLICY IF EXISTS "Users can read own redemptions" ON redemptions;
CREATE POLICY "Users or admins can read redemptions" ON redemptions
  FOR SELECT USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM business_admins
      WHERE business_admins.user_id = auth.uid()
      AND business_admins.business_id = redemptions.business_id
    )
  );

-- Redemptions INSERT: only admins of the business
DROP POLICY IF EXISTS "Users can insert own redemptions" ON redemptions;
CREATE POLICY "Admins can insert redemptions for their business" ON redemptions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM business_admins
      WHERE business_admins.user_id = auth.uid()
      AND business_admins.business_id = redemptions.business_id
    )
  );

-- Visits SELECT: user can read own, admin can read for their business
DROP POLICY IF EXISTS "Users can read own visits" ON visits;
CREATE POLICY "Users or admins can read visits" ON visits
  FOR SELECT USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM business_admins
      WHERE business_admins.user_id = auth.uid()
      AND business_admins.business_id = visits.business_id
    )
  );

-- 6. PostgreSQL function for atomic concurrent-safe redemption (LAST)
CREATE OR REPLACE FUNCTION create_admin_redemption(
  p_user_id UUID,
  p_business_id UUID,
  p_reward_id UUID,
  p_redeemed_by UUID
) RETURNS TABLE(visits_remaining INTEGER, visits_consumed INTEGER) AS $$
DECLARE
  v_required INTEGER;
  v_total INTEGER;
  v_used INTEGER;
  v_available INTEGER;
BEGIN
  -- Validate reward: single query combining all conditions
  SELECT required_visits INTO v_required
  FROM rewards
  WHERE id = p_reward_id
    AND business_id = p_business_id
    AND is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'INVALID_REWARD';
  END IF;

  -- Lock existing redemptions for this user+business to prevent concurrent double-redeem
  SELECT COALESCE(SUM(visits_used), 0) INTO v_used
  FROM redemptions
  WHERE user_id = p_user_id AND business_id = p_business_id
  FOR UPDATE;

  -- Count total visits
  SELECT COUNT(*) INTO v_total
  FROM visits
  WHERE user_id = p_user_id AND business_id = p_business_id;

  -- Calculate available
  v_available := v_total - v_used;

  -- Validate sufficient visits
  IF v_available < v_required THEN
    RAISE EXCEPTION 'INSUFFICIENT_VISITS:%', v_available;
  END IF;

  -- Insert redemption (no status field)
  INSERT INTO redemptions (user_id, business_id, reward_id, visits_used, redeemed_by)
  VALUES (p_user_id, p_business_id, p_reward_id, v_required, p_redeemed_by);

  -- Return remaining visits and consumed visits
  visits_remaining := v_available - v_required;
  visits_consumed := v_required;
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
