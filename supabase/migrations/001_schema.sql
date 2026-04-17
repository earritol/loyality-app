-- =============================================================================
-- Local Loyalty Platform - Database Schema
-- =============================================================================

-- Users table: id references Supabase Auth UUID directly
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Businesses table
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (name <> ''),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Locations table (optional, for businesses with multiple branches)
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Visits table
CREATE TABLE visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  method TEXT NOT NULL CHECK (method IN ('qr', 'manual')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Rewards table
CREATE TABLE rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  required_visits INTEGER NOT NULL CHECK (required_visits > 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Redemptions table
CREATE TABLE redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES rewards(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'redeemed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tickets table (optional feature)
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- Indexes
-- =============================================================================

-- One visit per user per business per UTC calendar day
CREATE UNIQUE INDEX visits_user_business_day_idx
  ON visits (user_id, business_id, DATE(created_at AT TIME ZONE 'UTC'));

-- Prevent duplicate pending redemptions for same user + reward
CREATE UNIQUE INDEX redemptions_user_reward_pending_idx
  ON redemptions (user_id, reward_id) WHERE status = 'pending';

-- =============================================================================
-- Row-Level Security
-- =============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Users: read/update own record only
CREATE POLICY "Users can read own record" ON users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own record" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Visits: read/insert own only
CREATE POLICY "Users can read own visits" ON visits
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own visits" ON visits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Redemptions: read/insert own only
CREATE POLICY "Users can read own redemptions" ON redemptions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own redemptions" ON redemptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Tickets: read/insert own only
CREATE POLICY "Users can read own tickets" ON tickets
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tickets" ON tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Businesses: readable by any authenticated user
CREATE POLICY "Authenticated users can read businesses" ON businesses
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Rewards: readable by any authenticated user
CREATE POLICY "Authenticated users can read rewards" ON rewards
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Locations: readable by any authenticated user
CREATE POLICY "Authenticated users can read locations" ON locations
  FOR SELECT USING (auth.uid() IS NOT NULL);
