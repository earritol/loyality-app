'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redeemRewardSchema, rewardFormSchema, updateRewardSchema, toggleRewardSchema } from '@/lib/validations/reward'
import { checkIsBusinessAdmin } from '@/lib/actions/business'
import type { ActionResult } from '@/lib/types'

export async function redeemReward(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = redeemRewardSchema.safeParse({ rewardId: formData.get('rewardId') })
  if (!parsed.success) return { success: false, error: 'ID de recompensa inválido.' }

  const { rewardId } = parsed.data
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado.' }

  const { data: reward } = await supabase
    .from('rewards')
    .select('id, business_id, required_visits, is_active')
    .eq('id', rewardId)
    .single()

  if (!reward || !reward.is_active) return { success: false, error: 'Recompensa no encontrada o inactiva.' }

  const { count } = await supabase
    .from('visits')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('business_id', reward.business_id)

  const visitCount = count ?? 0
  if (visitCount < reward.required_visits) {
    const remaining = reward.required_visits - visitCount
    return { success: false, error: `Te faltan ${remaining} visita${remaining === 1 ? '' : 's'} para canjear esta recompensa.` }
  }

  const { data: existing } = await supabase
    .from('redemptions')
    .select('id')
    .eq('user_id', user.id)
    .eq('reward_id', rewardId)
    .eq('status', 'pending')
    .single()

  if (existing) return { success: false, error: 'Ya tienes un canje pendiente para esta recompensa.' }

  const { error } = await supabase.from('redemptions').insert({
    user_id: user.id, reward_id: rewardId, status: 'pending',
  })

  if (error) {
    if (error.code === '23505') return { success: false, error: 'Ya tienes un canje pendiente para esta recompensa.' }
    return { success: false, error: error.message }
  }

  revalidatePath('/inicio')
  return { success: true }
}

export async function createReward(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const businessId = formData.get('businessId') as string
  const raw = {
    name: formData.get('name') as string,
    description: formData.get('description') as string | null,
    requiredVisits: Number(formData.get('requiredVisits')),
    expiresAt: formData.get('expiresAt') as string | null,
    maxRedemptionsPerUser: formData.get('maxRedemptionsPerUser') ? Number(formData.get('maxRedemptionsPerUser')) : null,
  }

  const parsed = rewardFormSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  const isAdmin = await checkIsBusinessAdmin(user.id, businessId)
  if (!isAdmin) return { success: false, error: 'No tienes permisos para realizar esta acción' }

  const { error } = await supabase.from('rewards').insert({
    business_id: businessId,
    name: parsed.data.name,
    description: parsed.data.description,
    required_visits: parsed.data.requiredVisits,
    expires_at: parsed.data.expiresAt,
    max_redemptions_per_user: parsed.data.maxRedemptionsPerUser ?? null,
    is_active: true,
  })

  if (error) {
    console.error('createReward error', { userId: user.id, businessId, error })
    return { success: false, error: 'Error al crear el premio' }
  }

  revalidatePath(`/${formData.get('slug')}/admin/premios`)
  return { success: true }
}

export async function updateReward(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const businessId = formData.get('businessId') as string
  const raw = {
    rewardId: formData.get('rewardId') as string,
    name: formData.get('name') as string,
    description: formData.get('description') as string | null,
    requiredVisits: Number(formData.get('requiredVisits')),
    expiresAt: formData.get('expiresAt') as string | null,
    maxRedemptionsPerUser: formData.get('maxRedemptionsPerUser') ? Number(formData.get('maxRedemptionsPerUser')) : null,
  }

  const parsed = updateRewardSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  const isAdmin = await checkIsBusinessAdmin(user.id, businessId)
  if (!isAdmin) return { success: false, error: 'No tienes permisos para realizar esta acción' }

  const { error } = await supabase.from('rewards')
    .update({
      name: parsed.data.name,
      description: parsed.data.description,
      required_visits: parsed.data.requiredVisits,
      expires_at: parsed.data.expiresAt,
      max_redemptions_per_user: parsed.data.maxRedemptionsPerUser ?? null,
    })
    .eq('id', parsed.data.rewardId)
    .eq('business_id', businessId)

  if (error) {
    console.error('updateReward error', { userId: user.id, businessId, error })
    return { success: false, error: 'Error al actualizar el premio' }
  }

  revalidatePath(`/${formData.get('slug')}/admin/premios`)
  return { success: true }
}

export async function toggleRewardStatus(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const businessId = formData.get('businessId') as string
  const raw = { rewardId: formData.get('rewardId') as string }

  const parsed = toggleRewardSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: 'ID inválido' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  const isAdmin = await checkIsBusinessAdmin(user.id, businessId)
  if (!isAdmin) return { success: false, error: 'No tienes permisos para realizar esta acción' }

  const { data: reward } = await supabase
    .from('rewards')
    .select('is_active')
    .eq('id', parsed.data.rewardId)
    .eq('business_id', businessId)
    .single()

  if (!reward) return { success: false, error: 'Premio no encontrado' }

  const { error } = await supabase.from('rewards')
    .update({ is_active: !reward.is_active })
    .eq('id', parsed.data.rewardId)
    .eq('business_id', businessId)

  if (error) {
    console.error('toggleRewardStatus error', { userId: user.id, businessId, error })
    return { success: false, error: 'Error al cambiar el estado' }
  }

  revalidatePath(`/${formData.get('slug')}/admin/premios`)
  return { success: true }
}
