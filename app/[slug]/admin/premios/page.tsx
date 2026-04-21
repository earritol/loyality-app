import { createClient } from '@/lib/supabase/server'
import { getBusinessBySlug } from '@/lib/actions/business'
import { RewardManager } from '@/components/admin/reward-manager'
import { notFound } from 'next/navigation'
import type { Reward } from '@/lib/types'

export default async function PremiosPage({
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
    .order('created_at', { ascending: false })

  const rewards: Reward[] = data ?? []

  return (
    <div className="min-h-screen bg-gana-bg">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gana-text">{business.name}</h1>
        <p className="text-xs font-semibold text-gana-green uppercase tracking-wide mt-1">Premios</p>

        <div className="mt-6">
          <RewardManager businessId={business.id} slug={slug} rewards={rewards} />
        </div>
      </div>
    </div>
  )
}
