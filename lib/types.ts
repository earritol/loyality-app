export type ActionResult<T = void> = {
  success: boolean
  data?: T
  error?: string
}

export type User = {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  is_platform_admin: boolean
  created_at: string
}

export type Business = {
  id: string
  name: string
  slug: string | null
  description: string | null
  logo_url: string | null
  program_name: string | null
  rules_text: string | null
  terms_text: string | null
  max_visits_per_day: number
  status: 'active' | 'past_due' | 'suspended'
  billing_cutoff_day: number | null
  last_payment_date: string | null
  subscription_id: string | null
  subscription_status: string | null
  billing_mode: 'manual' | 'subscription'
  monthly_price: number
  created_at: string
}

export type BusinessAdmin = {
  id: string
  business_id: string
  user_id: string
  role: 'owner' | 'staff'
  created_at: string
}

export type Location = {
  id: string
  business_id: string
  name: string
  address: string | null
  created_at: string
}

export type Visit = {
  id: string
  user_id: string
  business_id: string
  location_id: string | null
  method: 'qr' | 'manual'
  created_at: string
}

export type Reward = {
  id: string
  business_id: string
  name: string
  description: string | null
  required_visits: number
  is_active: boolean
  expires_at: string | null
  max_redemptions_per_user: number | null
  created_at: string
}

export type Redemption = {
  id: string
  user_id: string
  business_id: string
  reward_id: string
  visits_used: number
  redeemed_by: string | null
  /** @deprecated Maintained for backward compatibility only. Do NOT use in new code. */
  status?: 'pending' | 'redeemed'
  created_at: string
}

export type LoyaltyStats = {
  totalVisits: number
  usedVisits: number
  availableVisits: number
}

export type DashboardMetrics = {
  visitsToday: number
  totalVisits: number
  uniqueCustomers: number
  totalRedemptions: number
  activeRewards: number
  visitsThisWeek: number
  visitsThisMonth: number
  topCustomers: Array<{ name: string; visits: number }>
}

export type RecentActivity = {
  recentVisits: Array<{
    id: string
    userName: string
    method: string
    createdAt: string
  }>
  recentRedemptions: Array<{
    id: string
    userName: string
    rewardName: string
    visitsUsed: number
    createdAt: string
  }>
}

export type ClassifiedReward = {
  reward: Reward
  redeemable: boolean
  visitsNeeded: number
}

export type TeamMember = {
  id: string
  userId: string
  email: string
  firstName: string | null
  lastName: string | null
  role: 'owner' | 'staff'
  createdAt: string
}

export type Ticket = {
  id: string
  user_id: string
  business_id: string
  image_url: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export type Payment = {
  id: string
  business_id: string
  amount: number
  payment_date: string
  method: 'cash' | 'transfer' | 'online'
  notes: string | null
  created_at: string
}
