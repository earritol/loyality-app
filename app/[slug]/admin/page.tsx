import { getBusinessBySlug } from '@/lib/actions/business'
import { Card } from '@/components/ui/card'
import { BusinessLogo } from '@/components/ui/business-logo'
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

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href={`/${slug}/admin/registrar`}>
            <Card className="hover:border-gana-green/30 transition-colors cursor-pointer">
              <span className="text-2xl">📷</span>
              <p className="mt-2 font-semibold text-gana-text">Registrar visita</p>
              <p className="text-xs text-gana-muted mt-1">Escanea QR o registra manualmente</p>
            </Card>
          </Link>

          <Link href={`/${slug}/admin/premios`}>
            <Card className="hover:border-gana-green/30 transition-colors cursor-pointer">
              <span className="text-2xl">🎁</span>
              <p className="mt-2 font-semibold text-gana-text">Premios</p>
              <p className="text-xs text-gana-muted mt-1">Configura recompensas para tus clientes</p>
            </Card>
          </Link>

          <Link href={`/${slug}/admin/configurar`}>
            <Card className="hover:border-gana-green/30 transition-colors cursor-pointer">
              <span className="text-2xl">⚙️</span>
              <p className="mt-2 font-semibold text-gana-text">Configurar negocio</p>
              <p className="text-xs text-gana-muted mt-1">Nombre, descripción y logo</p>
            </Card>
          </Link>
        </div>

        {/* Placeholder para métricas futuras */}
        <div className="mt-8">
          <h2 className="text-lg font-bold text-gana-text">Resumen</h2>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <Card className="text-center">
              <p className="text-3xl font-bold text-gana-green">—</p>
              <p className="text-xs text-gana-muted mt-1">Visitas hoy</p>
            </Card>
            <Card className="text-center">
              <p className="text-3xl font-bold text-gana-green">—</p>
              <p className="text-xs text-gana-muted mt-1">Clientes totales</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
