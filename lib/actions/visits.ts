'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/lib/types'

export async function recordVisitForBusiness(
  customerId: string,
  businessId: string
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const { data: admin } = await supabase
    .from('business_admins')
    .select('id')
    .eq('user_id', user.id)
    .eq('business_id', businessId)
    .single()

  if (!admin) {
    return { success: false, error: 'Not allowed' }
  }
  
  const { error } = await supabase.from('visits').insert({
    user_id: customerId,
    business_id: businessId,
    method: 'manual',
  })

  if (error) {
    // Unique constraint violation = same-day duplicate
    if (error.code === '23505') {
      return {
        success: false,
        error: "This customer already has a visit recorded today.",
      }
    }
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
