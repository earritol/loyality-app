import { Card } from '@/components/ui/card'
import type { LoyaltyStats } from '@/lib/types'

type Props = {
  stats: LoyaltyStats
  userName: string
}

export function LoyaltyStatsCard({ stats, userName }: Props) {
  return (
    <Card>
      <p className="text-sm font-medium text-gana-text">{userName}</p>
      <div className="mt-3 flex items-center gap-4">
        <div className="text-center flex-1">
          <p className="text-2xl font-bold text-gana-green">{stats.availableVisits}</p>
          <p className="text-xs text-gana-muted">Disponibles</p>
        </div>
        <div className="text-center flex-1 opacity-60">
          <p className="text-lg font-semibold text-gana-text">{stats.totalVisits}</p>
          <p className="text-xs text-gana-muted">Totales</p>
        </div>
        <div className="text-center flex-1 opacity-60">
          <p className="text-lg font-semibold text-gana-text">{stats.usedVisits}</p>
          <p className="text-xs text-gana-muted">Usadas</p>
        </div>
      </div>
    </Card>
  )
}
