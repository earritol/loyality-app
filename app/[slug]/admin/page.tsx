import { getBusinessBySlug } from '@/lib/actions/business'
import { getAdminDashboardData } from '@/lib/actions/dashboard'
import { Card } from '@/components/ui/card'
import { BusinessLogo } from '@/components/ui/business-logo'
import { MetricsGrid } from '@/components/admin/metrics-grid'
import { RecentActivitySection } from '@/components/admin/recent-activity'
import { BillingAlert } from '@/components/admin/billing-alert'
import { BillingSection } from '@/components/admin/billing-section'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const business = await getBusinessBySlug(slug)
  if (!business) notFound()

  const { metrics, activity } = await getAdminDashboardData(business.id)

  return (
    <div className="min-h-screen bg-gana-bg">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4">
          <BusinessLogo logoUrl={business.logo_url} name={business.name} size="lg" />
          <div>
            <h1 className="text-2xl font-bold text-gana-text">{business.name}</h1>
            <p className="text-xs font-semibold text-gana-green uppercase tracking-wide mt-1">Panel de administración</p>
          </div>
        </div>

        {/* Billing alert — only for past_due/suspended, dismissable, once per day */}
        <BillingAlert status={business.status} billingCutoffDay={business.billing_cutoff_day} businessId={business.id} />

        {/* Helper text */}
        <p className="mt-4 text-xs text-gana-muted">
          Cada visita registrada acerca a tus clientes a una recompensa. Registra visitas para aumentar la lealtad.
        </p>

        {/* Quick links */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {business.status === 'suspended' ? (
            <Card className="text-center py-4 opacity-50 cursor-not-allowed">
              <span className="text-2xl">📷</span>
              <p className="mt-1 text-sm font-semibold text-gana-text">Registrar visita</p>
              <p className="text-xs text-gana-error mt-0.5">Suspendida</p>
            </Card>
          ) : (
            <Link href={`/${slug}/admin/registrar`}>
              <Card className="hover:border-gana-green/30 transition-colors cursor-pointer text-center py-4">
                <span className="text-2xl">📷</span>
                <p className="mt-1 text-sm font-semibold text-gana-text">Registrar visita</p>
              </Card>
            </Link>
          )}
          <Link href={`/${slug}/admin/premios`}>
            <Card className="hover:border-gana-green/30 transition-colors cursor-pointer text-center py-4">
              <span className="text-2xl">🎁</span>
              <p className="mt-1 text-sm font-semibold text-gana-text">Premios</p>
            </Card>
          </Link>
          <Link href={`/${slug}/admin/configurar`}>
            <Card className="hover:border-gana-green/30 transition-colors cursor-pointer text-center py-4">
              <span className="text-2xl">⚙️</span>
              <p className="mt-1 text-sm font-semibold text-gana-text">Configurar</p>
            </Card>
          </Link>
        </div>

        {/* Billing */}
        <div className="mt-6">
          <BillingSection businessId={business.id} billingMode={business.billing_mode ?? 'manual'} subscriptionStatus={business.subscription_status} />
        </div>

        {/* Metrics */}
        <div className="mt-8">
          <h2 className="text-lg font-bold text-gana-text">Métricas</h2>
          <div className="mt-3">
            <MetricsGrid metrics={metrics} />
          </div>
        </div>

        {/* Top customers */}
        <div className="mt-8">
          <h2 className="text-lg font-bold text-gana-text">Top clientes</h2>
          {metrics.topCustomers.length > 0 ? (
            <div className="mt-3 space-y-2">
              {metrics.topCustomers.map((c, i) => (
                <Card key={i} className="flex items-center justify-between py-3 px-4">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gana-green w-6 text-center">{i + 1}</span>
                    <p className="text-sm font-medium text-gana-text">{c.name}</p>
                  </div>
                  <p className="text-sm font-semibold text-gana-muted">{c.visits} visitas</p>
                </Card>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-gana-muted">Aún no hay clientes registrados.</p>
          )}
        </div>

        {/* Recent activity */}
        <div className="mt-8">
          <h2 className="text-lg font-bold text-gana-text">Actividad reciente</h2>
          <div className="mt-3">
            <RecentActivitySection activity={activity} />
          </div>
        </div>
      </div>
    </div>
  )
}
