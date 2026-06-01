'use server'

import { createClient } from '@/lib/supabase/server'
import { checkIsPlatformAdmin } from '@/lib/actions/backoffice'

export type AdminMetrics = {
  totalBusinesses: number
  activeBusinesses: number
  suspendedBusinesses: number
  totalUsers: number
  visitsToday: number
  visitsThisWeek: number
  visitsThisMonth: number
  redemptionsThisMonth: number
  paymentsThisMonth: number
  pendingPayments: PendingPayment[]
}

export type PendingPayment = {
  id: string
  name: string
  slug: string | null
  billing_cutoff_day: number | null
  last_payment_date: string | null
  monthly_price: number
}

export async function getAdminMetrics(): Promise<AdminMetrics | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const isAdmin = await checkIsPlatformAdmin(user.id)
  if (!isAdmin) return null

  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // Parallel queries
  const [
    bizResult,
    usersResult,
    visitsTodayResult,
    visitsWeekResult,
    visitsMonthResult,
    redemptionsResult,
    paymentsResult,
    allBizResult,
  ] = await Promise.all([
    supabase.from('businesses').select('id, status', { count: 'exact', head: true }),
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('visits').select('id', { count: 'exact', head: true }).gte('created_at', todayStr),
    supabase.from('visits').select('id', { count: 'exact', head: true }).gte('created_at', startOfWeek.toISOString()),
    supabase.from('visits').select('id', { count: 'exact', head: true }).gte('created_at', startOfMonth.toISOString()),
    supabase.from('redemptions').select('id', { count: 'exact', head: true }).gte('created_at', startOfMonth.toISOString()),
    supabase.from('payments').select('id', { count: 'exact', head: true }).gte('payment_date', startOfMonth.toISOString().split('T')[0]),
    supabase.from('businesses').select('id, name, slug, status, billing_cutoff_day, last_payment_date, monthly_price'),
  ])

  // Calculate pending payments
  // Logic: A business has a pending payment if the most recent payment deadline
  // has passed without a payment covering it.
  // The "most recent deadline" is the last occurrence of billing_cutoff_day.
  const currentDay = now.getDate()

  const pendingPayments: PendingPayment[] = (allBizResult.data ?? [])
    .filter((biz) => {
      if (!biz.billing_cutoff_day) return false
      if (biz.status === 'suspended') return false

      // Calculate the most recent payment deadline
      let deadlineMonth = now.getMonth()
      let deadlineYear = now.getFullYear()

      if (currentDay < biz.billing_cutoff_day) {
        // Deadline hasn't passed this month yet, check last month's deadline
        deadlineMonth -= 1
        if (deadlineMonth < 0) {
          deadlineMonth = 11
          deadlineYear -= 1
        }
      }

      // The deadline date is: deadlineYear-deadlineMonth-billing_cutoff_day
      const deadlineStr = `${deadlineYear}-${String(deadlineMonth + 1).padStart(2, '0')}-${String(biz.billing_cutoff_day).padStart(2, '0')}`

      // If no payment exists, it's pending
      if (!biz.last_payment_date) return true

      // If last payment is before the deadline, it's pending
      return biz.last_payment_date < deadlineStr
    })
    .map((biz) => ({
      id: biz.id,
      name: biz.name,
      slug: biz.slug,
      billing_cutoff_day: biz.billing_cutoff_day,
      last_payment_date: biz.last_payment_date,
      monthly_price: biz.monthly_price,
    }))

  // Count active/suspended
  const allBiz = allBizResult.data ?? []
  const activeBusinesses = allBiz.filter((b) => b.status === 'active').length
  const suspendedBusinesses = allBiz.filter((b) => b.status === 'suspended').length

  return {
    totalBusinesses: allBiz.length,
    activeBusinesses,
    suspendedBusinesses,
    totalUsers: usersResult.count ?? 0,
    visitsToday: visitsTodayResult.count ?? 0,
    visitsThisWeek: visitsWeekResult.count ?? 0,
    visitsThisMonth: visitsMonthResult.count ?? 0,
    redemptionsThisMonth: redemptionsResult.count ?? 0,
    paymentsThisMonth: paymentsResult.count ?? 0,
    pendingPayments,
  }
}
