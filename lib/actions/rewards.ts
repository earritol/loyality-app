'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redeemRewardSchema } from '@/lib/validations/reward'
import type { ActionResult } from '@/lib/types'

export async function redeemReward(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = redeemRewardSchema.safeParse({
    rewardId: formData.get('rewardId'),
  })

  if (!parsed.success) {
    return { success: false, error: 'ID de recompensa inválido.' }
  }

  const { rewardId } = parsed.data
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'No autenticado.' }
  }

  // Fetch reward details
  const { data: reward } = await supabase
    .from('rewards')
    .select('id, business_id, required_visits, is_active')
    .eq('id', rewardId)
    .single()

  if (!reward || !reward.is_active) {
    return { success: false, error: 'Recompensa no encontrada o inactiva.' }
  }

  // Count user visits for this business
  const { count } = await supabase
    .from('visits')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('business_id', reward.business_id)

  const visitCount = count ?? 0

  if (visitCount < reward.required_visits) {
    const remaining = reward.required_visits - visitCount
    return {
      success: false,
      error: `Te faltan ${remaining} visita${remaining === 1 ? '' : 's'} para canjear esta recompensa.`,
    }
  }

  // Check for existing pending redemption
  const { data: existing } = await supabase
    .from('redemptions')
    .select('id')
    .eq('user_id', user.id)
    .eq('reward_id', rewardId)
    .eq('status', 'pending')
    .single()

  if (existing) {
    return { success: false, error: 'Ya tienes un canje pendiente para esta recompensa.' }
  }

  // Insert redemption
  const { error } = await supabase.from('redemptions').insert({
    user_id: user.id,
    reward_id: rewardId,
    status: 'pending',
  })

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'Ya tienes un canje pendiente para esta recompensa.' }
    }
    return { success: false, error: error.message }
  }

  revalidatePath('/inicio')
  return { success: true }
}
