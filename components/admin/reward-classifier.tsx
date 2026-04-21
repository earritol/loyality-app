'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProgressBar } from '@/components/ui/progress-bar'
import { createAdminRedemption } from '@/lib/actions/redemptions'
import type { Reward } from '@/lib/types'

type Props = {
  rewards: Reward[]
  availableVisits: number
  userId: string
  businessId: string
  onRedeemed: (result: { rewardName: string; visitsRemaining: number; visitsUsed: number }) => void
}

export function RewardClassifier({ rewards, availableVisits, userId, businessId, onRedeemed }: Props) {
  const redeemable = rewards.filter(r => availableVisits >= r.required_visits)
  const inProgress = rewards.filter(r => availableVisits < r.required_visits)

  if (rewards.length === 0) {
    return (
      <Card className="text-center py-6">
        <span className="text-2xl">🎁</span>
        <p className="mt-2 text-sm text-gana-muted">No hay premios configurados para este negocio.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-gana-muted">
        Si el cliente ya tiene suficientes visitas, puedes canjear su recompensa aquí.
      </p>

      {/* Redeemable */}
      {redeemable.length > 0 ? (
        <div>
          <h4 className="text-sm font-bold text-gana-green flex items-center gap-1">🟢 Listo para canjear</h4>
          <div className="mt-2 space-y-2">
            {redeemable.map(r => (
              <RedeemableCard key={r.id} reward={r} userId={userId} businessId={businessId}
                availableVisits={availableVisits} onRedeemed={onRedeemed} />
            ))}
          </div>
        </div>
      ) : (
        <Card className="text-center py-4">
          <p className="text-sm text-gana-muted">Aún no hay recompensas disponibles para canjear</p>
        </Card>
      )}

      {/* In progress */}
      {inProgress.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-gana-muted flex items-center gap-1">🟡 En progreso</h4>
          <div className="mt-2 space-y-2">
            {inProgress.map(r => (
              <Card key={r.id} className="opacity-70">
                <p className="font-semibold text-gana-text">{r.name}</p>
                {r.description && <p className="text-xs text-gana-muted mt-0.5">{r.description}</p>}
                <p className="text-xs text-gana-muted mt-1">{availableVisits} / {r.required_visits} visitas</p>
                <div className="mt-2">
                  <ProgressBar current={availableVisits} total={r.required_visits} />
                </div>
                <p className="text-xs text-gana-muted mt-1">
                  Faltan {r.required_visits - availableVisits} visita{r.required_visits - availableVisits === 1 ? '' : 's'}
                </p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function RedeemableCard({ reward, userId, businessId, availableVisits, onRedeemed }: {
  reward: Reward; userId: string; businessId: string; availableVisits: number
  onRedeemed: (result: { rewardName: string; visitsRemaining: number; visitsUsed: number }) => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleRedeem() {
    setLoading(true)
    setError(null)
    const result = await createAdminRedemption(userId, businessId, reward.id)
    setLoading(false)
    if (result.success && result.data) {
      onRedeemed(result.data)
    } else {
      setError(result.error ?? 'Error al canjear')
    }
  }

  return (
    <Card className="border-gana-green/30">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-gana-text">{reward.name}</p>
            <Badge variant="visits">Listo</Badge>
          </div>
          {reward.description && <p className="text-xs text-gana-muted mt-0.5">{reward.description}</p>}
          <p className="text-xs text-gana-muted mt-1">{availableVisits} / {reward.required_visits} visitas</p>
          <div className="mt-2">
            <ProgressBar current={availableVisits} total={reward.required_visits} />
          </div>
        </div>
        <button onClick={handleRedeem} disabled={loading}
          className="ml-3 flex-shrink-0 rounded-xl bg-gana-green px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
          {loading ? 'Canjeando...' : 'Canjear'}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-gana-error">{error}</p>}
    </Card>
  )
}
