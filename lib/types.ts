export type ActionResult<T = void> = {
  success: boolean
  data?: T
  error?: string
}

export type User = {
  id: string
  email: string
  phone: string | null
  created_at: string
}

export type Business = {
  id: string
  name: string
  slug: string | null
  description: string | null
  created_at: string
}

export type BusinessAdmin = {
  id: string
  business_id: string
  user_id: string
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
  created_at: string
}

export type Redemption = {
  id: string
  user_id: string
  reward_id: string
  status: 'pending' | 'redeemed'
  created_at: string
}

export type Ticket = {
  id: string
  user_id: string
  business_id: string
  image_url: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}
