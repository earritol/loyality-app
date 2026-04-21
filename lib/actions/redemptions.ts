'use server'

import { createClient } from '@/lib/supabase/server'
import { checkIsBusinessAdmin } from '@/lib/actions/business'
import { adminRedemptionSchema } from '@/lib/validations/redemption'
import type { ActionResult, LoyaltyStats } from '@/lib/types'

type RedemptionResult = {
  rewardName: string
  visitsRemaining: number
  visitsUsed: number
}

export async function createAdminRedemption(
  userId: string,
  businessId: string,
  rewardId: string
): Promise<ActionResult<RedemptionResult>> {
  // Validate input
  const parsed = adminRedemptionSchema.safeParse({ userId, businessId, rewardId })
  if (!parsed.success) {
    return { success: false, error: 'Datos inválidos' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  // Verify admin
  const isAdmin = await checkIsBusinessAdmin(user.id, businessId)
  if (!isAdmin) return { success: false, error: 'No autorizado' }

  // Fetch reward to get name (for response) and validate it belongs to business + is active
  const { data: reward } = await supabase
    .from('rewards')
    .select('id, name, required_visits')
    .eq('id', rewardId)
    .eq('business_id', businessId)
    .eq('is_active', true)
    .single()

  if (!reward) {
    return { success: false, error: 'Recompensa no encontrada o inactiva.' }
  }

  // Call atomic RPC — DB function handles locking, validation, and insert
  const { data, error } = await supabase.rpc('create_admin_redemption', {
    p_user_id: userId,
    p_business_id: businessId,
    p_reward_id: rewardId,
    p_redeemed_by: user.id,
  })

  if (error) {
    const msg = error.message || ''
    if (msg.includes('INSUFFICIENT_VISITS')) {
      const available = msg.split(':')[1] || '0'
      const needed = reward.required_visits - Number(available)
      return {
        success: false,
        error: `Visitas insuficientes. Faltan ${needed} visita${needed === 1 ? '' : 's'}.`,
      }
    }
    if (msg.includes('INVALID_REWARD')) {
      return { success: false, error: 'Recompensa no encontrada o inactiva.' }
    }
    console.error('createAdminRedemption error', { userId, businessId, rewardId, error })
    return { success: false, error: 'Error al procesar el canje.' }
  }

  const result = Array.isArray(data) ? data[0] : data
  return {
    success: true,
    data: {
      rewardName: reward.name,
      visitsRemaining: result?.visits_remaining ?? 0,
      visitsUsed: result?.visits_consumed ?? reward.required_visits,
    },
  }
}

export async function getUserLoyaltyStats(
  userId: string,
  businessId: string
): Promise<LoyaltyStats> {
  const supabase = await createClient()

  const [visitsResult, usedResult] = await Promise.all([
    supabase
      .from('visits')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('business_id', businessId),
    supabase
      .from('redemptions')
      .select('visits_used')
      .eq('user_id', userId)
      .eq('business_id', businessId),
  ])

  const totalVisits = visitsResult.count ?? 0
  const usedVisits = (usedResult.data ?? []).reduce((sum, r) => sum + (r.visits_used ?? 0), 0)

  return {
    totalVisits,
    usedVisits,
    availableVisits: Math.max(0, totalVisits - usedVisits),
  }
}
