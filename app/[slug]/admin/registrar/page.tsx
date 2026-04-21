import { getBusinessBySlug } from '@/lib/actions/business'
import { AdminPanel } from '@/app/[slug]/admin/admin-panel'
import { notFound } from 'next/navigation'

export default async function RegistrarVisitaPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const business = await getBusinessBySlug(slug)
  if (!business) notFound()

  return <AdminPanel business={business} />
}
