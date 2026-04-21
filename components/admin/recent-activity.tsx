import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Badge } from '@/components/ui/badge'
import type { RecentActivity } from '@/lib/types'

type Props = {
  activity: RecentActivity
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('es-MX', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

export function RecentActivitySection({ activity }: Props) {
  return (
    <div className="space-y-6">
      {/* Recent visits */}
      <div>
        <h3 className="text-sm font-bold text-gana-text flex items-center gap-2">
          🟢 Visitas recientes
        </h3>
        {activity.recentVisits.length === 0 ? (
          <div className="mt-3">
            <EmptyState icon="👣" title="No hay actividad hoy" description="Las visitas registradas aparecerán aquí." />
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            {activity.recentVisits.map((v) => (
              <Card key={v.id} className="flex items-center justify-between py-3 px-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gana-text truncate">{v.userName}</p>
                  <p className="text-xs text-gana-muted">{formatDate(v.createdAt)}</p>
                </div>
                <Badge variant={v.method === 'qr' ? 'visits' : 'locked'}>
                  {v.method === 'qr' ? 'QR' : 'Manual'}
                </Badge>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recent redemptions */}
      <div>
        <h3 className="text-sm font-bold text-gana-text flex items-center gap-2">
          🔵 Canjes recientes
        </h3>
        {activity.recentRedemptions.length === 0 ? (
          <div className="mt-3">
            <EmptyState icon="🎁" title="Sin canjes" description="Aún no se han realizado canjes." />
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            {activity.recentRedemptions.map((r) => (
              <Card key={r.id} className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gana-text truncate">{r.userName}</p>
                    <p className="text-xs text-gana-muted">{r.rewardName} · {r.visitsUsed} visitas</p>
                  </div>
                  <p className="text-xs text-gana-muted flex-shrink-0 ml-2">{formatDate(r.createdAt)}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
