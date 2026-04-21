import { getBusinessBySlug } from '@/lib/actions/business'
import { Card } from '@/components/ui/card'
import { BusinessSettingsForm } from '@/components/admin/business-settings-form'
import { notFound } from 'next/navigation'

export default async function ConfigurarPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const business = await getBusinessBySlug(slug)
  if (!business) notFound()

  return (
    <div className="min-h-screen bg-gana-bg">
      <div className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gana-text">{business.name}</h1>
        <p className="text-xs font-semibold text-gana-green uppercase tracking-wide mt-1">Configuración</p>
        <Card className="mt-6">
          <BusinessSettingsForm business={business} slug={slug} />
        </Card>
      </div>
    </div>
  )
}
