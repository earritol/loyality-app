-- Add logo_url column to businesses
ALTER TABLE businesses ADD COLUMN logo_url TEXT;

-- Allow admins to update their business
CREATE POLICY "Admins can update their business" ON businesses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM business_admins
      WHERE business_admins.user_id = auth.uid()
      AND business_admins.business_id = businesses.id
    )
  );
