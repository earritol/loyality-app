import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { RedeemButton } from '@/components/redeem-button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { ProgressBar } from '@/components/ui/progress-bar'
import Link from 'next/link'

export default async function BusinessDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/entrar')

  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, slug, description')
    .eq('slug', slug)
    .single()

  if (!business) {
    return (
      <div className="min-h-screen bg-gana-bg flex items-center justify-center">
        <EmptyState icon="🔍" title="No encontrado" description="Este negocio no existe." />
      </div>
    )
  }

  const { count: visitCount } = await supabase
    .from('visits')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('business_id', business.id)

  const { data: rewards } = await supabase
    .from('rewards')
    .select('id, name, description, required_visits')
    .eq('business_id', business.id)
    .eq('is_active', true)
    .order('required_visits', { ascending: true })

  const rewardIds = (rewards ?? []).map((r) => r.id)
  const { data: redemptions } = rewardIds.length > 0
    ? await supabase
        .from('redemptions')
        .select('id, reward_id, status')
        .eq('user_id', user.id)
        .in('reward_id', rewardIds)
    : { data: [] }

  const pendingRewardIds = new Set(
    (redemptions ?? []).filter((r) => r.status === 'pending').map((r) => r.reward_id)
  )
  const redeemedRewardIds = new Set(
    (redemptions ?? []).filter((r) => r.status === 'redeemed').map((r) => r.reward_id)
  )

  const visits = visitCount ?? 0

  return (
    <div className="min-h-screen bg-gana-bg">
      <div className="max-w-lg mx-auto px-4 py-8">
        <Link href="/inicio" className="text-sm text-gana-green font-medium hover:underline">
          ← Volver al inicio
        </Link>

        <div className="mt-4">
          <h1 className="text-2xl font-bold text-gana-text">{business.name}</h1>
          {business.description && (
            <p className="mt-1 text-sm text-gana-muted">{business.description}</p>
          )}
        </div>

        <Card className="mt-6 text-center">
          <p className="text-4xl font-bold text-gana-green">{visits}</p>
          <p className="text-sm text-gana-muted">{visits === 1 ? 'visita' : 'visitas'}</p>
        </Card>

        <div className="mt-8">
          <h2 className="text-lg font-bold text-gana-text">Recompensas</h2>

          {(rewards ?? []).length === 0 ? (
            <div className="mt-4">
              <EmptyState
                icon="🎁"
                title="Sin recompensas aún"
                description="Este negocio aún no tiene recompensas disponibles."
              />
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {(rewards ?? []).map((reward) => {
                const canRedeem = visits >= reward.required_visits
                const isPending = pendingRewardIds.has(reward.id)
                const isRedeemed = redeemedRewardIds.has(reward.id)
                const remaining = reward.required_visits - visits

                return (
                  <Card key={reward.id}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gana-text">{reward.name}</p>
                        {reward.description && (
                          <p className="mt-0.5 text-sm text-gana-muted">{reward.description}</p>
                        )}
                        <p className="mt-1 text-xs text-gana-muted">
                          {reward.required_visits} visitas requeridas
                        </p>
                      </div>
                      <div className="ml-3 flex-shrink-0">
                        {isRedeemed ? (
                          <Badge variant="redeemed">✓ Canjeado</Badge>
                        ) : isPending ? (
                          <Badge variant="pending">⏳ Pendiente</Badge>
                        ) : canRedeem ? (
                          <RedeemButton rewardId={reward.id} />
                        ) : (
                          <Badge variant="locked">
                            Te faltan {remaining}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="mt-3">
                      <ProgressBar current={visits} total={reward.required_visits} />
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
