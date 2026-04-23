import { createClient } from '@/lib/supabase/server'
import { getBusinessBySlug } from '@/lib/actions/business'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { SubscriptionActions } from '@/components/admin/subscription-actions'
import { notFound } from 'next/navigation'

export default async function SuscripcionPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const business = await getBusinessBySlug(slug)
  if (!business) notFound()

  const supabase = await createClient()

  // Payment history
  const { data: payments } = await supabase
    .from('payments')
    .select('id, amount, payment_date, method, notes, created_at')
    .eq('business_id', business.id)
    .order('payment_date', { ascending: false })
    .limit(10)

  const statusLabels: Record<string, { label: string; variant: 'visits' | 'pending' | 'locked' }> = {
    active: { label: 'Activa', variant: 'visits' },
    past_due: { label: 'Pago pendiente', variant: 'pending' },
    suspended: { label: 'Suspendida', variant: 'locked' },
  }

  const s = statusLabels[business.status] ?? statusLabels.active

  return (
    <div className="min-h-screen bg-gana-bg">
      <div className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gana-text">Mi suscripción</h1>
        <p className="text-xs font-semibold text-gana-green uppercase tracking-wide mt-1">{business.name}</p>

        {/* Status */}
        <Card className="mt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gana-text">Estado de cuenta</p>
              <p className="text-xs text-gana-muted mt-0.5">
                ${business.monthly_price} MXN / mes
                {business.billing_cutoff_day && ` · Corte día ${business.billing_cutoff_day}`}
              </p>
            </div>
            <Badge variant={s.variant}>{s.label}</Badge>
          </div>
          {business.last_payment_date && (
            <p className="text-xs text-gana-muted mt-2">
              Último pago: {new Date(business.last_payment_date + 'T00:00:00').toLocaleDateString('es-MX')}
            </p>
          )}
          {business.billing_mode === 'subscription' && business.subscription_status === 'active' && (
            <p className="text-xs text-gana-green mt-1">✓ Pago automático activo</p>
          )}
        </Card>

        {/* Actions */}
        <div className="mt-6">
          <SubscriptionActions
            businessId={business.id}
            billingMode={business.billing_mode ?? 'manual'}
            subscriptionStatus={business.subscription_status}
            status={business.status}
            monthlyPrice={business.monthly_price}
          />
        </div>

        {/* Payment history */}
        <div className="mt-8">
          <h2 className="text-lg font-bold text-gana-text">Historial de pagos</h2>
          {(payments ?? []).length === 0 ? (
            <div className="mt-4">
              <EmptyState icon="💳" title="Sin pagos registrados" description="Los pagos realizados aparecerán aquí." />
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {(payments ?? []).map((p) => (
                <Card key={p.id} className="flex items-center justify-between py-3 px-4">
                  <div>
                    <p className="text-sm font-medium text-gana-text">${p.amount} MXN</p>
                    <p className="text-xs text-gana-muted">
                      {new Date(p.payment_date + 'T00:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                      {p.method === 'cash' ? ' · Efectivo' : p.method === 'online' ? ' · En línea' : ' · Transferencia'}
                    </p>
                    {p.notes && <p className="text-xs text-gana-muted">{p.notes}</p>}
                  </div>
                  <Badge variant="visits">✓</Badge>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
