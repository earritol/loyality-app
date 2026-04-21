'use server'

import { createClient } from '@/lib/supabase/server'
import type { DashboardMetrics, RecentActivity } from '@/lib/types'

export async function getAdminDashboardData(
  businessId: string
): Promise<{ metrics: DashboardMetrics; activity: RecentActivity }> {
  const supabase = await createClient()

  const now = new Date()
  const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString()

  // Monday of current week (UTC)
  const dayOfWeek = now.getUTCDay()
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const weekStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - mondayOffset)).toISOString()

  // First day of current month (UTC)
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString()

  // Run all metric queries in parallel
  const [
    visitsTodayRes,
    totalVisitsRes,
    uniqueCustomersRes,
    totalRedemptionsRes,
    activeRewardsRes,
    visitsWeekRes,
    visitsMonthRes,
    topCustomersRes,
    recentVisitsRes,
    recentRedemptionsRes,
  ] = await Promise.all([
    // Visits today
    supabase.from('visits').select('id', { count: 'exact', head: true })
      .eq('business_id', businessId).gte('created_at', todayStart),
    // Total visits
    supabase.from('visits').select('id', { count: 'exact', head: true })
      .eq('business_id', businessId),
    // Unique customers
    supabase.from('visits').select('user_id')
      .eq('business_id', businessId),
    // Total redemptions
    supabase.from('redemptions').select('id', { count: 'exact', head: true })
      .eq('business_id', businessId),
    // Active rewards
    supabase.from('rewards').select('id', { count: 'exact', head: true })
      .eq('business_id', businessId).eq('is_active', true),
    // Visits this week
    supabase.from('visits').select('id', { count: 'exact', head: true })
      .eq('business_id', businessId).gte('created_at', weekStart),
    // Visits this month
    supabase.from('visits').select('id', { count: 'exact', head: true })
      .eq('business_id', businessId).gte('created_at', monthStart),
    // Top 5 customers
    supabase.from('visits').select('user_id, users(first_name, last_name, email)')
      .eq('business_id', businessId),
    // Recent 10 visits
    supabase.from('visits').select('id, user_id, method, created_at, users(first_name, last_name, email)')
      .eq('business_id', businessId).order('created_at', { ascending: false }).limit(5),
    // Recent 5 redemptions
    supabase.from('redemptions').select('id, user_id, visits_used, created_at, users(first_name, last_name, email), rewards(name)')
      .eq('business_id', businessId).order('created_at', { ascending: false }).limit(5),
  ])

  // Calculate unique customers
  const uniqueUserIds = new Set((uniqueCustomersRes.data ?? []).map((v) => v.user_id))

  // Calculate top 5 customers
  const customerVisitMap = new Map<string, { name: string; visits: number }>()
  for (const v of (topCustomersRes.data ?? [])) {
    const u = v.users as unknown as { first_name: string | null; last_name: string | null; email: string } | null
    if (!u) continue
    const existing = customerVisitMap.get(v.user_id)
    if (existing) {
      existing.visits++
    } else {
      const name = u.first_name ? `${u.first_name} ${u.last_name ?? ''}`.trim() : u.email
      customerVisitMap.set(v.user_id, { name, visits: 1 })
    }
  }
  const topCustomers = Array.from(customerVisitMap.values())
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 5)

  // Format recent visits
  const recentVisits = (recentVisitsRes.data ?? []).map((v) => {
    const u = v.users as unknown as { first_name: string | null; last_name: string | null; email: string } | null
    return {
      id: v.id,
      userName: u?.first_name ? `${u.first_name} ${u.last_name ?? ''}`.trim() : u?.email ?? 'Desconocido',
      method: v.method,
      createdAt: v.created_at,
    }
  })

  // Format recent redemptions
  const recentRedemptions = (recentRedemptionsRes.data ?? []).map((r) => {
    const u = r.users as unknown as { first_name: string | null; last_name: string | null; email: string } | null
    const rw = r.rewards as unknown as { name: string } | null
    return {
      id: r.id,
      userName: u?.first_name ? `${u.first_name} ${u.last_name ?? ''}`.trim() : u?.email ?? 'Desconocido',
      rewardName: rw?.name ?? 'Desconocido',
      visitsUsed: r.visits_used,
      createdAt: r.created_at,
    }
  })

  return {
    metrics: {
      visitsToday: visitsTodayRes.count ?? 0,
      totalVisits: totalVisitsRes.count ?? 0,
      uniqueCustomers: uniqueUserIds.size,
      totalRedemptions: totalRedemptionsRes.count ?? 0,
      activeRewards: activeRewardsRes.count ?? 0,
      visitsThisWeek: visitsWeekRes.count ?? 0,
      visitsThisMonth: visitsMonthRes.count ?? 0,
      topCustomers,
    },
    activity: {
      recentVisits,
      recentRedemptions,
    },
  }
}
