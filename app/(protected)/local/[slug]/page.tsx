import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserLoyaltyStats } from '@/lib/actions/redemptions'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { ProgressBar } from '@/components/ui/progress-bar'
import { BusinessLogo } from '@/components/ui/business-logo'
import Link from 'next/link'
import Image from 'next/image'

function getExpirationLabel(expiresAt: string): { text: string; urgent: boolean } | null {
  const now = new Date()
  const exp = new Date(expiresAt)
  const diffMs = exp.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays <= 0) return { text: 'Expira hoy', urgent: true }
  if (diffDays === 1) return { text: 'Expira mañana', urgent: true }
  if (diffDays <= 2) return { text: '⚠️ Expira pronto', urgent: true }
  return { text: `Expira en ${diffDays} días`, urgent: false }
}

function formatExpirationDate(expiresAt: string): string {
  return new Date(expiresAt).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

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
    .select('id, name, slug, description, logo_url, program_name, rules_text, terms_text')
    .eq('slug', slug)
    .single()

  if (!business) {
    return (
      <div className="min-h-screen bg-gana-bg flex items-center justify-center">
        <EmptyState icon="🔍" title="No encontrado" description="Este negocio no existe." />
      </div>
    )
  }

  const stats = await getUserLoyaltyStats(user.id, business.id)

  // Active rewards — filter expired server-side using Supabase NOW()
  const { data: rewards } = await supabase
    .from('rewards')
    .select('id, name, description, required_visits, expires_at')
    .eq('business_id', business.id)
    .eq('is_active', true)
    .or('expires_at.is.null,expires_at.gte.now()')
    .order('required_visits', { ascending: true })

  const { data: redemptionHistory } = await supabase
    .from('redemptions')
    .select('id, created_at, visits_used, rewards(name)')
    .eq('user_id', user.id)
    .eq('business_id', business.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const available = stats.availableVisits

  return (
    <div className="min-h-screen bg-gana-bg">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div>
          <BusinessLogo logoUrl={business.logo_url} name={business.name} size="lg" className="mb-3" />
          <h1 className="text-2xl font-bold text-gana-text">{business.name}</h1>
          {business.description && (
            <p className="mt-1 text-sm text-gana-muted">{business.description}</p>
          )}
        </div>

        {/* Loyalty summary */}
        <Card className="mt-6 text-center">
          <p className="text-4xl font-bold text-gana-green">{available}</p>
          <p className="text-sm text-gana-text font-medium">
            {available === 1 ? 'visita disponible' : 'visitas disponibles'}
          </p>
          <p className="text-xs text-gana-muted mt-1">
            {stats.totalVisits} visita{stats.totalVisits === 1 ? '' : 's'} en total
          </p>
        </Card>

        {/* Active rewards */}
        <div className="mt-8">
          <div className="flex items-center gap-2">
            <Image src="/icon-star.png" alt="" width={28} height={28} />
            <h2 className="text-lg font-bold text-gana-text">Recompensas</h2>
          </div>

          {(rewards ?? []).length === 0 ? (
            <div className="mt-4">
              <EmptyState icon="🎁" title="Sin recompensas aún" description="Este negocio aún no tiene recompensas disponibles." />
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {(rewards ?? []).map((reward) => {
                const canRedeem = available >= reward.required_visits
                const remaining = reward.required_visits - available
                const expLabel = reward.expires_at ? getExpirationLabel(reward.expires_at) : null

                return (
                  <Card key={reward.id} className={canRedeem ? 'border-gana-green/30' : ''}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gana-text">{reward.name}</p>
                          {canRedeem && <Badge variant="visits">🎉 Listo</Badge>}
                          {expLabel && (
                            <span className={`text-xs ${expLabel.urgent ? 'text-gana-error font-medium' : 'text-gana-muted'}`}>
                              {expLabel.text}
                            </span>
                          )}
                        </div>
                        {reward.description && (
                          <p className="mt-0.5 text-sm text-gana-muted">{reward.description}</p>
                        )}
                        <p className="text-xs text-gana-muted mt-1">
                          {available} / {reward.required_visits} visitas
                        </p>
                        {reward.expires_at && (
                          <p className="text-xs text-gana-muted">
                            Válido hasta {formatExpirationDate(reward.expires_at)}
                          </p>
                        )}
                      </div>
                      {!canRedeem && (
                        <Badge variant="locked">Faltan {remaining}</Badge>
                      )}
                    </div>
                    <div className="mt-3">
                      <ProgressBar current={available} total={reward.required_visits} />
                    </div>
                    {canRedeem ? (
                      <p className="mt-2 text-xs text-gana-green font-medium">
                        🎉 ¡Ya puedes reclamar esta recompensa en el negocio!
                      </p>
                    ) : (
                      <p className="mt-2 text-xs text-gana-muted">
                        Te faltan {remaining} visita{remaining === 1 ? '' : 's'} para esta recompensa
                      </p>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Rules section */}
        {business.rules_text && (
          <div className="mt-8">
            <h2 className="text-lg font-bold text-gana-text">Reglas del programa</h2>
            <Card className="mt-3">
              <p className="text-sm text-gana-text whitespace-pre-line">{business.rules_text}</p>
            </Card>
          </div>
        )}

        {/* Terms link */}
        {business.terms_text && (
          <div className="mt-4 text-center">
            <Link href={`/local/${slug}/terminos`} className="text-sm text-gana-green hover:underline">
              Ver términos y condiciones
            </Link>
          </div>
        )}

        {/* Redemption history */}
        <div className="mt-8">
          <h2 className="text-lg font-bold text-gana-text">Historial de recompensas</h2>
          {(redemptionHistory ?? []).length === 0 ? (
            <div className="mt-4">
              <EmptyState icon="🏆" title="Aún no has canjeado recompensas" description="Sigue acumulando visitas para obtener premios." />
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {(redemptionHistory ?? []).map((r) => {
                const rw = r.rewards as unknown as { name: string } | null
                const date = new Date(r.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })
                return (
                  <Card key={r.id} className="flex items-center justify-between py-3 px-4">
                    <div>
                      <p className="text-sm font-medium text-gana-text">{rw?.name ?? 'Recompensa'}</p>
                      <p className="text-xs text-gana-muted">Canjeado el {date}</p>
                    </div>
                    <Badge variant="redeemed">✓</Badge>
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
