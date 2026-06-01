import { getAllBusinesses } from '@/lib/actions/backoffice'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { BackofficeActions } from '@/components/backoffice/backoffice-actions'
import { CreateBusinessForm } from '@/components/backoffice/create-business-form'

const statusLabels: Record<string, { label: string; variant: 'visits' | 'pending' | 'locked' }> = {
  active: { label: 'Activa', variant: 'visits' },
  past_due: { label: 'Pago pendiente', variant: 'pending' },
  suspended: { label: 'Suspendida', variant: 'locked' },
}

export default async function AdminNegociosPage() {
  const result = await getAllBusinesses()
  const businesses = result.success ? (result.data ?? []) : []

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold">Negocios</h1>
      <p className="text-sm text-muted-foreground mt-1">Crear, editar y administrar negocios</p>

      {/* Create business */}
      <Card className="mt-6 px-4">
        <h2 className="font-bold text-gana-text">Crear negocio</h2>
        <CreateBusinessForm />
      </Card>

      {/* Business list */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-gana-text">Todos los negocios ({businesses.length})</h2>
        {businesses.length === 0 ? (
          <div className="mt-4">
            <EmptyState icon="🏪" title="Sin negocios" description="Crea el primer negocio desde el formulario." />
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {businesses.map((biz) => {
              const s = statusLabels[biz.status] ?? statusLabels.active
              return (
                <Card key={biz.id} className="px-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gana-text">{biz.name}</p>
                        <Badge variant={s.variant}>{s.label}</Badge>
                      </div>
                      <p className="text-xs text-gana-muted mt-1">/{biz.slug}</p>
                      <div className="flex flex-wrap gap-4 mt-2 text-xs text-gana-muted">
                        <span>Dueño: {biz.ownerEmail ?? 'Sin asignar'}</span>
                        <span>Último pago: {biz.last_payment_date ? new Date(biz.last_payment_date + 'T00:00:00').toLocaleDateString('es-MX') : 'Sin pagos registrados'}</span>
                        <span>Fecha de pago: {biz.billing_cutoff_day ? `Día ${biz.billing_cutoff_day}` : 'Sin fecha configurada'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <BackofficeActions business={biz} currentStatus={biz.status} />
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
