import { createClient } from '@/lib/supabase/server'
import { getBusinessBySlug } from '@/lib/actions/business'
import { AdminPanel } from '@/app/[slug]/admin/admin-panel'
import { notFound } from 'next/navigation'
import type { Reward } from '@/lib/types'

export default async function RegistrarVisitaPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const business = await getBusinessBySlug(slug)
  if (!business) notFound()

  const supabase = await createClient()
  const { data } = await supabase
    .from('rewards')
    .select('*')
    .eq('business_id', business.id)
    .eq('is_active', true)
    .order('required_visits', { ascending: true })

  const rewards: Reward[] = data ?? []

  return <AdminPanel business={business} rewards={rewards} />
}
