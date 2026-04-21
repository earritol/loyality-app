-- Admins can insert rewards for their business
CREATE POLICY "Admins can insert rewards for their business" ON rewards
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM business_admins
      WHERE business_admins.user_id = auth.uid()
      AND business_admins.business_id = rewards.business_id
    )
  );

-- Admins can update rewards for their business
CREATE POLICY "Admins can update rewards for their business" ON rewards
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM business_admins
      WHERE business_admins.user_id = auth.uid()
      AND business_admins.business_id = rewards.business_id
    )
  );
