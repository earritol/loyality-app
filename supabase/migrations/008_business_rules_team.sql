-- =============================================================================
-- 008: Business Rules, Reward Settings, Team Management
-- =============================================================================

-- 1. New columns on businesses
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS program_name TEXT,
  ADD COLUMN IF NOT EXISTS rules_text TEXT,
  ADD COLUMN IF NOT EXISTS terms_text TEXT,
  ADD COLUMN IF NOT EXISTS max_visits_per_day INTEGER NOT NULL DEFAULT 1 CHECK (max_visits_per_day >= 1);

-- 2. New columns on rewards
ALTER TABLE rewards
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS max_redemptions_per_user INTEGER CHECK (max_redemptions_per_user > 0);

-- 3. Role column on business_admins (owner | staff)
ALTER TABLE business_admins
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'staff'));

-- 4. RLS: owners can insert team members (same business_id)
CREATE POLICY "Owners can insert team members" ON business_admins
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM business_admins ba
      WHERE ba.user_id = auth.uid()
      AND ba.business_id = business_admins.business_id
      AND ba.role = 'owner'
    )
  );

-- 5. RLS: owners can delete team members (same business_id)
CREATE POLICY "Owners can delete team members" ON business_admins
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM business_admins ba
      WHERE ba.user_id = auth.uid()
      AND ba.business_id = business_admins.business_id
      AND ba.role = 'owner'
    )
  );

-- 6. RLS: team members (owner + staff) can update their business
-- Drop existing policy if any (from migration 006)
DROP POLICY IF EXISTS "Admins can update their business" ON businesses;
CREATE POLICY "Team members can update their business" ON businesses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM business_admins
      WHERE business_admins.user_id = auth.uid()
      AND business_admins.business_id = businesses.id
    )
  );

-- 7. RLS: users can read their own admin records (simple, no recursion)
DROP POLICY IF EXISTS "Admins can read own admin records" ON business_admins;
DROP POLICY IF EXISTS "Team members can read own business team" ON business_admins;
CREATE POLICY "Users can read own admin records" ON business_admins
  FOR SELECT USING (auth.uid() = user_id);

-- 8. Replace PG function with v2: adds expiration + redemption limit checks
CREATE OR REPLACE FUNCTION create_admin_redemption(
  p_user_id UUID,
  p_business_id UUID,
  p_reward_id UUID,
  p_redeemed_by UUID
) RETURNS TABLE(visits_remaining INTEGER, visits_consumed INTEGER) AS $$
DECLARE
  v_required INTEGER;
  v_expires_at TIMESTAMPTZ;
  v_max_per_user INTEGER;
  v_redemption_count INTEGER;
  v_total INTEGER;
  v_used INTEGER;
  v_available INTEGER;
BEGIN
  -- Validate reward: single query combining all conditions
  SELECT required_visits, expires_at, max_redemptions_per_user
  INTO v_required, v_expires_at, v_max_per_user
  FROM rewards
  WHERE id = p_reward_id
    AND business_id = p_business_id
    AND is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'INVALID_REWARD';
  END IF;

  -- Check expiration: expires_at < NOW() means expired
  IF v_expires_at IS NOT NULL AND v_expires_at < NOW() THEN
    RAISE EXCEPTION 'REWARD_EXPIRED';
  END IF;

  -- Check max redemptions per user
  IF v_max_per_user IS NOT NULL THEN
    SELECT COUNT(*) INTO v_redemption_count
    FROM redemptions
    WHERE user_id = p_user_id AND reward_id = p_reward_id;

    IF v_redemption_count >= v_max_per_user THEN
      RAISE EXCEPTION 'REDEMPTION_LIMIT_REACHED';
    END IF;
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
