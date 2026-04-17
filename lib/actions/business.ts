'use server'

import { createClient } from '@/lib/supabase/server'
import type { Business } from '@/lib/types'

export async function getBusinessBySlug(
  slug: string
): Promise<Business | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .single()

  return data
}

export async function checkIsBusinessAdmin(
  userId: string,
  businessId: string
): Promise<boolean> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('business_admins')
    .select('id')
    .eq('user_id', userId)
    .eq('business_id', businessId)
    .maybeSingle()

  return !!data
}
