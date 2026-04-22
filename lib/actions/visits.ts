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
    return { success: false, error: 'No autenticado' }
  }

  const { data: admin } = await supabase
    .from('business_admins')
    .select('id')
    .eq('user_id', user.id)
    .eq('business_id', businessId)
    .single()

  if (!admin) {
    return { success: false, error: 'No tienes permisos para realizar esta acción' }
  }

  // Check max_visits_per_day limit
  const { data: business } = await supabase
    .from('businesses')
    .select('max_visits_per_day')
    .eq('id', businessId)
    .single()

  const maxPerDay = business?.max_visits_per_day ?? 1

  // Count today's visits (America/Mexico_City timezone)
  // NOTE: Using Intl.DateTimeFormat to get MX date without hardcoding UTC offset.
  // For production, consider migrating to a SQL-based timezone function for full accuracy.
  const now = new Date()
  const mxParts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Mexico_City',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  }).formatToParts(now)

  const get = (type: string) => mxParts.find(p => p.type === type)?.value ?? '00'
  const mxDateStr = `${get('year')}-${get('month')}-${get('day')}T00:00:00`

  // Convert MX midnight back to UTC for the gte filter
  const mxMidnight = new Date(new Date(mxDateStr).toLocaleString('en-US', { timeZone: 'America/Mexico_City' }))
  // Use the ISO string of MX today start for filtering
  const mxTodayISO = new Date(mxDateStr + 'Z').toISOString()

  // Simple approach: count visits created today in MX timezone
  // We filter by the MX date string to avoid offset issues
  const { data: todayVisits } = await supabase
    .from('visits')
    .select('created_at')
    .eq('user_id', customerId)
    .eq('business_id', businessId)

  const mxToday = `${get('year')}-${get('month')}-${get('day')}`
  const todayCount = (todayVisits ?? []).filter(v => {
    const visitMx = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Mexico_City', year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(new Date(v.created_at))
    return visitMx === mxToday
  }).length

  if ((todayCount) >= maxPerDay) {
    return {
      success: false,
      error: 'Este cliente ya alcanzó el límite de visitas por hoy',
    }
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
        error: 'Este cliente ya registró su visita hoy. Puedes continuar con el canje si tiene recompensas disponibles.',
      }
    }
    return { success: false, error: error.message }
  }

  revalidatePath('/inicio')
  return { success: true }
}
