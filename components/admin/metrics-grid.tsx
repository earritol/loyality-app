import { Card } from '@/components/ui/card'
import type { DashboardMetrics } from '@/lib/types'

type Props = {
  metrics: DashboardMetrics
}

const items: Array<{ key: keyof DashboardMetrics; label: string; icon: string }> = [
  { key: 'visitsToday', label: 'Visitas hoy', icon: '📅' },
  { key: 'totalVisits', label: 'Total visitas', icon: '👣' },
  { key: 'uniqueCustomers', label: 'Clientes únicos', icon: '👥' },
  { key: 'totalRedemptions', label: 'Canjes realizados', icon: '🎁' },
  { key: 'activeRewards', label: 'Premios activos', icon: '⭐' },
  { key: 'visitsThisWeek', label: 'Esta semana', icon: '📊' },
  { key: 'visitsThisMonth', label: 'Este mes', icon: '📈' },
]

export function MetricsGrid({ metrics }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map(({ key, label, icon }) => (
        <Card key={key} className="text-center py-4 px-3">
          <span className="text-xl">{icon}</span>
          <p className="mt-1 text-2xl font-bold text-gana-green">
            {typeof metrics[key] === 'number' ? metrics[key] : 0}
          </p>
          <p className="text-xs text-gana-muted mt-0.5">{label}</p>
        </Card>
      ))}
    </div>
  )
}
