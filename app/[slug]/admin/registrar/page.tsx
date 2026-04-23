import { createClient } from '@/lib/supabase/server'
import { getBusinessBySlug } from '@/lib/actions/business'
import { AdminPanel } from '@/app/[slug]/admin/admin-panel'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Reward } from '@/lib/types'

export default async function RegistrarVisitaPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const business = await getBusinessBySlug(slug)
  if (!business) notFound()

  // Block access if suspended
  if (business.status === 'suspended') {
    return (
      <div className="min-h-screen bg-gana-bg flex items-center justify-center px-4">
        <Card className="max-w-md text-center py-8">
          <span className="text-4xl">🚫</span>
          <h1 className="mt-4 text-xl font-bold text-gana-text">Cuenta suspendida</h1>
          <p className="mt-2 text-sm text-gana-muted">
            No es posible registrar visitas mientras la cuenta esté suspendida. Contacta al administrador para reactivarla.
          </p>
          <Link href={`/${slug}/admin`} className="mt-4 inline-block text-sm text-gana-green hover:underline">
            ← Volver al dashboard
          </Link>
        </Card>
      </div>
    )
  }

  const supabase = await createClient()
  const { data } = await supabase
    .from('rewards')
    .select('*')
    .eq('business_id', business.id)
    .eq('is_active', true)
    .order('required_visits', { ascending: true })

  const rewards: Reward[] = data ?? []

  return <AdminPanel business={business} rewards={rewards} />
}
